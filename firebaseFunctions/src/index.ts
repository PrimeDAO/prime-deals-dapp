import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import { getAddress } from "ethers/lib/utils";
import { ITokenSwapDeal } from "./types";
import { initializeVotes, initializeVotingSummary, isRegistrationDataPrivacyOnlyUpdate, isRegistrationDataUpdated, updateRepresentativesAndVotes } from "./helpers";

const admin = firebaseAdmin.initializeApp();
export const firestore = admin.firestore();
export const DEALS_COLLECTION = "deals";
export const PRIMARY_DAO_VOTES_COLLECTION = "primary-dao-votes";
export const PARTNER_DAO_VOTES_COLLECTION = "partner-dao-votes";

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
    const deal = snapshot.data() as ITokenSwapDeal;

    const primaryDaoRepresentativesAddresses = deal.registrationData.primaryDAO.representatives.map(item => item.address);
    const partnerDaoRepresentativesAddresses = deal.registrationData.partnerDAO ? deal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

    const dealId: string = context.params.dealId;

    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}`);

    batch.set(
      dealRef,
      {
        representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
        isReady: true, // set the "isReady" flag to true. Firestore rules should block any operations on deals with flag "isReady" set to false
        meta: {
          votingSummary: initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
        },
      },
      { merge: true },
    );

    initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

    await batch.commit();
  });

export const updateDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onUpdate(async (change, context) => {
    const dealId: string = context.params.dealId;
    const oldDeal = change.before.data() as ITokenSwapDeal;
    const updatedDeal = change.after.data() as ITokenSwapDeal;

    if (
      !updatedDeal ||
      !isRegistrationDataUpdated(oldDeal, updatedDeal) ||
      isRegistrationDataPrivacyOnlyUpdate(oldDeal, updatedDeal)
    ) {
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
        meta: {
          votingSummary: initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
        },
      },
      {merge: true},
    );

    return batch.commit();
  });
