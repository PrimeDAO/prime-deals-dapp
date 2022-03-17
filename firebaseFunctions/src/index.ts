import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import { getAddress } from "ethers/lib/utils";
import {isEqual} from "lodash";

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

interface ITokenSwapDeal {
  registrationData: IDealRegistrationTokenSwap;
}

const admin = firebaseAdmin.initializeApp();
const firestore = admin.firestore();
const DEALS_COLLECTION = "deals";
const PRIMARY_DAO_VOTES_COLLECTION = "primary-dao-votes";
const PARTNER_DAO_VOTES_COLLECTION = "partner-dao-votes";

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
    const deal = snapshot.data() as {registrationData: IDealRegistrationTokenSwap, isReady: boolean};
    // deal should have "ready" flag set to false (should already be set to false on the client)

    const primaryDaoRepresentativesAddresses = deal.registrationData.primaryDAO.representatives.map(item => item.address);
    const partnerDaoRepresentativesAddresses = deal.registrationData.partnerDAO ? deal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

    const dealId: string = context.params.dealId;

    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}`);

    batch.set(
      dealRef,
      {
        representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
        isReady: true,
      },
      { merge: true },
    );
    // set the "ready" flag to true. Firestore rules should block any operations on deals with flag "ready" set to false

    initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

    await batch.commit();
  });

export const updateDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onUpdate(async (change, context) => {
    const dealId: string = context.params.dealId;
    const oldDeal = change.before.data() as ITokenSwapDeal;
    const updatedDeal = change.after.data() as ITokenSwapDeal;

    if (!updatedDeal || isRegistrationDataPrivacyOnlyUpdate(oldDeal, updatedDeal)) {
      return;
    }

    const batch = firestore.batch();

    const primaryDaoRepresentativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
    const partnerDaoRepresentativesAddresses = updatedDeal.registrationData.partnerDAO ? updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

    await updateRepresentativesAndVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

    batch.set(
      change.after.ref,
      {
        representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
      },
      {merge: true},
    );

    return batch.commit();
  });

function isRegistrationDataPrivacyOnlyUpdate(oldDeal: ITokenSwapDeal, updatedDeal: ITokenSwapDeal): boolean {
  const oldDealRegistrationData = JSON.parse(JSON.stringify(oldDeal.registrationData));
  const updatedDealRegistrationData = JSON.parse(JSON.stringify(updatedDeal.registrationData));
  delete oldDealRegistrationData.isPrivate;
  delete updatedDealRegistrationData.isPrivate;

  return isEqual(oldDealRegistrationData, updatedDealRegistrationData);
}

async function updateRepresentativesAndVotes(
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
) {
  // delete current votes
  const votes = await Promise.all([
    firestore.collection(`/${DEALS_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}`).listDocuments(),
    firestore.collection(`/${DEALS_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}`).listDocuments(),
  ]);

  votes.forEach(daoVotes => {
    daoVotes.forEach(voteRef => {
      batch.delete(voteRef);
    });
  });

  initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
}

function initializeVotes(
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
) {
  primaryDaoRepresentativesAddresses.forEach(address => {
    const representativeRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(representativeRef, {vote: null});
  });

  partnerDaoRepresentativesAddresses.forEach(address => {
    const representativeRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(representativeRef, {vote: null});
  });
}

// if an address already in votes collection don't do anything

// if address deleted from representativesAddresses remove the vote

// if address new - initialize the vote for it

// update representativesAddresses

// update votes collection (don't replace documents that already exist if deleted)

// update voting summary object
