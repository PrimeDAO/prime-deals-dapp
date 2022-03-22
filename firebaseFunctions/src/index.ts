import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import { getAddress } from "ethers/lib/utils";
import { IDealTokenSwapDocument } from "../../src/entities/IDealSharedTypes";
import { generateVotingSummary, initializeVotes, initializeVotingSummary, isRegistrationDataPrivacyOnlyUpdate, isRegistrationDataUpdated, resetVotes } from "./helpers";

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

/**
 * Run every time a new document (a deal) in deals collection is created
 */
export const buildDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onCreate(async (snapshot, context) => {
    const deal = snapshot.data() as IDealTokenSwapDocument;

    const primaryDaoRepresentativesAddresses = deal.registrationData.primaryDAO.representatives.map(item => item.address);
    const partnerDaoRepresentativesAddresses = deal.registrationData.partnerDAO ? deal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

    const dealId: string = context.params.dealId;

    // Creates a write batch, used for performing multiple writes as a single atomic operation.
    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}`);

    // adds meta object to the deal document
    batch.set(
      dealRef,
      {
        meta: {
          isReady: true, // set the "isReady" flag to true. Firestore rules should block any operations on deals with flag "isReady" set to false
          representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
          votingSummary: initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
        },
      },
      { merge: true }, // merges provided object with the existing data
    );

    // updates batch with writes for creating vote object for each representative
    initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

    // commits all writes added to the batch
    await batch.commit();
  });

/**
 * Run every time a document (a deal) in deals collection is updated
 */
export const updateDealStructure = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}`)
  .onUpdate(async (change, context) => {
    const dealId: string = context.params.dealId;
    const oldDeal = change.before.data() as IDealTokenSwapDocument;
    const updatedDeal = change.after.data() as IDealTokenSwapDocument;

    // Proceed only if registration data was updated and the update was done to field/fields other than the privacy flag
    if (
      !updatedDeal ||
      !isRegistrationDataUpdated(oldDeal, updatedDeal) ||
      isRegistrationDataPrivacyOnlyUpdate(oldDeal, updatedDeal)
    ) {
      return;
    }

    // Creates a write batch, used for performing multiple writes as a single atomic operation.
    const batch = firestore.batch();

    // get updated representatives address for both DAOs
    const primaryDaoRepresentativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
    const partnerDaoRepresentativesAddresses = updatedDeal.registrationData.partnerDAO ? updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

    await resetVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

    batch.set(
      change.after.ref, // reference to the updated Deal document
      {
        registrationData: {
          modifiedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        },
        meta: {
          representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
          votingSummary: initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
        },
      },
      {merge: true}, // merges provided object with the existing data
    );

    return batch.commit();
  });

/**
 * Run every time a document in a deal subcollection is updated
 */
export const onVoteUpdate = functions.firestore
  .document(`${DEALS_COLLECTION}/{dealId}/{collection}/{representativeAddress}`)
  .onUpdate(async (change, context) => {
    const dealSubcollection = context.params.collection;

    // make sure that updated document is a subcollection of votes and not some other subcollection
    if (dealSubcollection !== PRIMARY_DAO_VOTES_COLLECTION && dealSubcollection !== PARTNER_DAO_VOTES_COLLECTION) {
      return;
    }

    const dealId = context.params.dealId;

    // Creates a write batch, used for performing multiple writes as a single atomic operation.
    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}`);

    // generate updated voting summary after a vote was updated
    const votingSummary = await generateVotingSummary(dealId);

    batch.set(
      dealRef,
      {
        meta: {
          votingSummary,
        },
      },
      {merge: true}, // merges provided object with the existing data
    );

    return batch.commit();
  });
