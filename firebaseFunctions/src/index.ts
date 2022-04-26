import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import * as shortUuid from "short-uuid";
import { getAddress, verifyMessage } from "ethers/lib/utils";
import { IDealTokenSwapDocument } from "../../src/entities/IDealTypes";
import { generateVotingSummary, initializeVotes, initializeVotingSummary, isModifiedAtOnlyUpdate, isRegistrationDataPrivacyOnlyUpdate, isRegistrationDataUpdated, resetVotes, updateDealUpdatesCollection } from "./helpers";
import { DEALS_TOKEN_SWAP_COLLECTION, FIREBASE_MESSAGE_TO_SIGN } from "../../src/services/FirestoreTypes";
import { IDealRegistrationTokenSwap } from "../../src/entities/DealRegistrationTokenSwap";

const admin = firebaseAdmin.initializeApp();
export const firestore = admin.firestore();
export const PRIMARY_DAO_VOTES_COLLECTION = "primary-dao-votes";
export const PARTNER_DAO_VOTES_COLLECTION = "partner-dao-votes";
const USERS_COLLECTION = "users";

// Allow cross-origin requests for functions which use it
// It is necessary to accept HTTP requests from our app,
// as firebase functions are not hosted on the same domain
const cors = corsLib({
  origin: true,
});

/**
 * Run every time a document (a deal) in deals-token-swap collection is created
 */
export const onDealCreate = functions.firestore
  .document(`${DEALS_TOKEN_SWAP_COLLECTION}/{dealId}`)
  .onCreate((snapshot) => {
    updateDealUpdatesCollection(snapshot.id);
  });

/**
 * Run every time a document (a deal) in deals-token-swap collection is updated
 */
export const updateDealStructure = functions.firestore
  .document(`${DEALS_TOKEN_SWAP_COLLECTION}/{dealId}`)
  .onUpdate(async (change, context) => {
    const dealId: string = context.params.dealId;
    const oldDeal = change.before.data() as IDealTokenSwapDocument;
    const updatedDeal = change.after.data() as IDealTokenSwapDocument;

    // In case it was a delete operation, or the only update was modifiedAt field
    if (!updatedDeal || isModifiedAtOnlyUpdate(oldDeal, updatedDeal)) {
      return;
    }

    updateDealUpdatesCollection(dealId);

    // Creates a write batch, used for performing multiple writes as a single atomic operation.
    const batch = firestore.batch();

    const dealUpdates: Partial<IDealTokenSwapDocument> = {
      // modifiedAt: new Date().toISOString(),
    };

    // If registration data was updated and the update was done to field/fields other than the privacy flag
    if (
      isRegistrationDataUpdated(oldDeal, updatedDeal) &&
      !isRegistrationDataPrivacyOnlyUpdate(oldDeal, updatedDeal)
    ) {
      // get updated representatives address for both DAOs
      const primaryDaoRepresentativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
      const partnerDaoRepresentativesAddresses = updatedDeal.registrationData.partnerDAO ? updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address) : [];

      await resetVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

      dealUpdates.representativesAddresses = [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses];
      dealUpdates.votingSummary = initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
    }

    batch.set(
      change.after.ref, // reference to the updated Deal document
      dealUpdates,
      {merge: true}, // merges provided object with the existing data
    );

    return batch.commit();
  });

/**
 * Run every time a document in a deal subcollection is updated
 */
export const onVoteUpdate = functions.firestore
  .document(`${DEALS_TOKEN_SWAP_COLLECTION}/{dealId}/{collection}/{representativeAddress}`)
  .onUpdate(async (change, context) => {
    const dealSubcollection = context.params.collection;

    // make sure that updated document is a subcollection of votes and not some other subcollection
    if (dealSubcollection !== PRIMARY_DAO_VOTES_COLLECTION && dealSubcollection !== PARTNER_DAO_VOTES_COLLECTION) {
      return;
    }

    const dealId = context.params.dealId;

    // Creates a write batch, used for performing multiple writes as a single atomic operation.
    const batch = firestore.batch();

    const dealRef = firestore.doc(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}`);

    // generate updated voting summary after a vote was updated
    const votingSummary = await generateVotingSummary(dealId);

    batch.set(
      dealRef,
      {
        votingSummary,
        // modifiedAt: new Date().toISOString(),
      },
      {merge: true}, // merges provided object with the existing data
    );

    return batch.commit();
  });

export const createDeal = functions.https.onRequest(
  (request, response) =>
  // Allow cross-origin requests for this function
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.registrationData) {
        return response.sendStatus(400);
      }

      functions.logger.log("Check if request is authorized with Firebase ID token");

      if ((!request.headers.authorization || !request.headers.authorization.startsWith("Bearer "))) {
        functions.logger.error(
          "No Firebase ID token was passed as a Bearer token in the Authorization header.",
          "Make sure you authorize your request by providing the following HTTP header:",
          "Authorization: Bearer <Firebase ID Token>",
        );
        return response.sendStatus(403);
      }

      functions.logger.log("Found \"Authorization\" header");

      // Read the Token from the Authorization header.
      const idToken = request.headers.authorization.split("Bearer ")[1];
      let decodedIdToken: firebaseAdmin.auth.DecodedIdToken;

      try {
        decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log("ID Token correctly decoded", decodedIdToken);
      } catch (error) {
        functions.logger.error("Error while verifying Firebase ID token:", error);
        return response.sendStatus(403);
      }

      const registrationData: IDealRegistrationTokenSwap = request.body.registrationData;

      const primaryDaoRepresentativesAddresses = registrationData.primaryDAO.representatives.map(item => item.address);
      const partnerDaoRepresentativesAddresses = registrationData.partnerDAO ? registrationData.partnerDAO.representatives.map(item => item.address) : [];

      const dealId = shortUuid.generate();
      const date = new Date().toISOString();

      const dealData: Partial<IDealTokenSwapDocument> = {
        id: dealId,
        registrationData,
        createdByAddress: decodedIdToken.uid,
        createdAt: date,
        modifiedAt: date,
        representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
        votingSummary: initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
        isWithdrawn: false,
        isRejected: false,
      };

      // Creates a write batch, used for performing multiple writes as a single atomic operation.
      const batch = firestore.batch();

      const dealRef = firestore.doc(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}`);

      // set deal document
      batch.set(
        dealRef,
        dealData,
      );

      // updates batch with writes for creating vote object for each representative
      initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);

      try {
        // commits all writes added to the batch
        await batch.commit();

        const deal = (await dealRef.get()).data();

        return response.status(200).send(deal);// .json(deal);
      } catch (error){
        functions.logger.error("Error while creating a deal:", error);
        return response.sendStatus(500);
      }
    }),
);

/**
 * Creates/updates a document in the users collection,
 * which contains date when the request was made and returns it
 */
export const getDateToSign = functions.https.onRequest(
  (request, response) =>
  // Allow cross-origin requests for this function
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.address) {
        return response.sendStatus(400);
      }

      /**
       * Address coming from the request body
       */
      const address: string = request.body.address;

      // Fail if provided address is not an ethereum address
      try {
        getAddress(address);
      } catch {
        return response.sendStatus(500);
      }

      try {
        /**
         * Current date as a UTC string, later used as a part of message the user is going to sign
         */
        const authenticationRequestDate = new Date().toUTCString();

        // Create/update document for the provided address, storing the current time, to be used to create signature
        await admin
          .firestore()
          .collection(USERS_COLLECTION)
          .doc(address)
          .set({authenticationRequestDate});

        return response.status(200).json({ authenticationRequestDate });
      } catch (error) {
        functions.logger.error(error);
        return response.sendStatus(500);
      }
    }),
);

/**
 * Verifies that a message was signed by the provided address.
 * Therefore it proofs the ownership of the address.
 */
export const verifySignedMessageAndCreateCustomToken = functions.https.onRequest(
  (request, response) =>
  // Allow cross-origin requests for this function
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.address || !request.body.signature) {
        return response.sendStatus(400);
      }

      const address: string = request.body.address;

      // Fail if provided address is not an ethereum address
      try {
        getAddress(address);
      } catch {
        return response.sendStatus(500);
      }

      const signature: string = request.body.signature;

      try {
        // Get the document with date when authentication process was started for this address
        const userDocRef = admin.firestore().collection(USERS_COLLECTION).doc(address);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          const authenticationRequestDate = userDoc.data()?.authenticationRequestDate;
          const messageToSign = `${FIREBASE_MESSAGE_TO_SIGN} ${authenticationRequestDate}`;

          const signerAddress = verifyMessage(
            messageToSign,
            signature,
          );

          // See if that matches the address the user is claiming the signature is from
          if (signerAddress.toLowerCase() === address.toLowerCase()) {
            // The signature was verified - reset the date to prevent replay attacks
            // update user doc
            await userDocRef.update({
              authenticationRequestDate: null,
            });

            try {
              // Create a custom token for the specified address
              /**
               * Firebase Token which is later going to be used to sign in to firebase from the client
               */
              const firebaseToken = await admin.auth().createCustomToken(address);

              // Return the token
              return response.status(200).json({ token: firebaseToken });
            } catch (error){
              functions.logger.error("createCustomToken error:", error);
              return response.sendStatus(500);
            }
          } else {
            // The signature could not be verified
            return response.sendStatus(401);
          }
        } else {
          return response.sendStatus(500);
        }
      } catch (error) {
        functions.logger.error(error);
        return response.sendStatus(500);
      }
    }),
);
