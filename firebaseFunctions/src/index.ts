import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import { getAddress } from "ethers/lib/utils";
import uniqBy from "lodash/uniqBy";

interface IProposal {
  title: string,
  summary: string,
  description: string;
}

enum Platforms {
  "Independent",
  "DAOstack",
  "Moloch",
  "OpenLaw",
  "Aragon",
  "Colony",
  "Compound Governance",
  "Snapshot",
  "Gnosis Safe / Snapshot",
  "Substrate",
}

interface IToken {
  address: string,

  name: string,
  symbol: string,
  decimals: number,
  logoURI: string,

  amount: string
  instantTransferAmount: string
  vestedTransferAmount: string
  vestedFor: number
  cliffOf: number
}

interface ISocialMedia {
  name: string,
  url: string,
}

interface IDAO {
  name: string;
  treasury_address: string;
  logoURI: string;
  social_medias: Array<ISocialMedia>;
  representatives: Array<{address: string}>;
  id?: string;
  tokens?: Array<IToken>;
  platform?: Platforms;
}

interface IProposalLead {
  address: string,
  email?: string;
  // dao?: IDAO /* Deprecated: Proposal lead does not need to be part of the a DAO */
}

interface IClause {
  id: string,
  text: string,
}

interface ITerms {
  clauses: Array<IClause>,
}

interface IDealRegistrationTokenSwap {
  version: string;
  proposal: IProposal;
  primaryDAO: IDAO;
  partnerDAO: IDAO;
  proposalLead: IProposalLead; // this contains to address
  terms: ITerms;
  keepAdminRights: boolean;
  offersPrivate: boolean;
  isPrivate: boolean;
  createdAt: Date | null;
  modifiedAt: Date | null;
  createdByAddress: string | null;
  executionPeriodInDays: number;
  dealType: "token-swap"/* | "co-liquidity"*/;
}

const admin = firebaseAdmin.initializeApp();
const firestore = admin.firestore();
const DEALS_COLLECTION = "deals";
const VOTES_COLLECTION = "votes";

// Allow cross-origin requests for functions which use it
// It is necessary to accept HTTP requests from our app,
// as firebase functions are not hosted on the same domain
const cors = corsLib({
  origin: true,
});

// creates a token that is used to sign in to firebase from the frontend
export const createCustomToken = functions.https.onRequest(
  (request, response) =>
    // Allow cross-origin requests for this function
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.address) {
        return response.sendStatus(400);
      }

      const address = request.body.address;

      // Fail if provided address is not an ethereum address
      try {
        getAddress(address);
      } catch {
        return response.sendStatus(500);
      }

      try {
        const firebaseToken = await admin.auth().createCustomToken(address);

        return response.status(200).json({ token: firebaseToken });
      } catch (error){
        functions.logger.error("createCustomToken error:", error);
        return response.sendStatus(500);
      }
    }),
);

export const buildDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onCreate(async (snapshot, context) => {
    console.log(snapshot.data(), context);

    const deal = snapshot.data() as {registrationData: IDealRegistrationTokenSwap, isReady: boolean};

    // TODO remove
    await new Promise(r => setTimeout(r, 10000));

    // create/update representativesAddresses

    const representativesAddresses = deal.registrationData.primaryDAO.representatives.map(item => item.address);
    if (deal.registrationData.partnerDAO) {
      representativesAddresses.push(...deal.registrationData.partnerDAO.representatives.map(item => item.address));
    }

    const dealId: string = context.params.dealId;

    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}`);

    batch.set(dealRef, {representativesAddresses, isReady: true}, {merge: true});

    representativesAddresses.forEach(address => {
      const representativeRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}/${VOTES_COLLECTION}/${address}`);
      batch.set(representativeRef, {vote: null});
    });

    await batch.commit();
  });

export const updateDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onUpdate((change, context) => {
    console.log(change);
    console.log(context.eventType);
    const oldDeal = change.after.data() as {registrationData: IDealRegistrationTokenSwap};
    const updatedDeal = change.after.data() as {registrationData: IDealRegistrationTokenSwap};
    // console.log("updatedDeal", updatedDeal);
    // console.log("oldDeal", oldDeal);

    if (!updatedDeal) {
      return;
    }

    const representativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
    if (updatedDeal.registrationData.partnerDAO) {
      representativesAddresses.push(...updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address));
    }

    // loop representativesAddresses

    // if an address already in votes collection don't do anything

    // deal should have "ready" flag set to false (should already be set to false on the client)

    // sanitize/validate schema on created/updated deal

    // create/update representativesAddresses

    // const representativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
    // if (updatedDeal.registrationData.partnerDAO) {
    //   representativesAddresses.push(...updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address));
    // }

    // return change.after.ref.set({
    //   registrationData: updatedDeal.registrationData,
    //   representativesAddresses,
    // });

    // create/update votes collection (don't replace documents that already exist if deleted)

    // create/update voting summary object

    // set the "ready" flag to true. Firestore rules should block any operations on deals with flag "ready" set to false
  });
