import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as googleCloudFirestore from "@google-cloud/firestore";
import * as corsLib from "cors";
import * as shortUuid from "short-uuid";
import { getAddress, verifyMessage } from "ethers/lib/utils";
import { IDealTokenSwapDocument } from "../../src/entities/IDealTypes";
import { generateVotingSummary, initializeVotes, initializeVotingSummary, isModifiedAtOnlyUpdate, isRegistrationDataPrivacyOnlyUpdate, isRegistrationDataUpdated, resetVotes, updateDealUpdatesCollection } from "./helpers";
import { DEALS_TOKEN_SWAP_COLLECTION } from "../../src/services/FirestoreTypes";
import { IDealRegistrationTokenSwap } from "../../src/entities/DealRegistrationTokenSwap";
import { verifyEIP1271Signature } from "./hash-validation";

const firestoreAdminClient = new googleCloudFirestore.v1.FirestoreAdminClient();
const admin = firebaseAdmin.initializeApp();
export const firestore = admin.firestore();
export const PRIMARY_DAO_VOTES_COLLECTION = "primary-dao-votes";
export const PARTNER_DAO_VOTES_COLLECTION = "partner-dao-votes";

// Allow cross-origin requests for functions which use it
// It is necessary to accept HTTP requests from our app,
// as firebase functions are not hosted on the same domain
const cors = corsLib({
  origin: true,
});

/**
 * Functions that are going to be deployed by CI
 */
export const CI = {
  /**
   * Run every time a document (a deal) in deals-token-swap collection is created
   */
  onDealCreate: functions.firestore
    .document(`${DEALS_TOKEN_SWAP_COLLECTION}/{dealId}`)
    .onCreate((snapshot) => {
      updateDealUpdatesCollection(snapshot.id);
    }),

  /**
   * Run every time a document (a deal) in deals-token-swap collection is updated
   */
  updateDealStructure: functions.firestore
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
    }),

  /**
   * Run every time a document in a deal subcollection is updated
   */
  onVoteUpdate: functions.firestore
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
    }),

  createDeal: functions.https.onRequest(
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
  ),

  /**
   * Verifies that a message was signed by the provided address.
   * Therefore it proofs the ownership of the address.
   */
  verifySignedMessageAndCreateCustomToken: functions.https.onRequest(
    (request, response) =>
    // Allow cross-origin requests for this function
      cors(request, response, async () => {
        if (request.method !== "POST") {
          return response.sendStatus(403);
        }

        if (!request.body.address || !request.body.message || !request.body.signature) {
          functions.logger.error("missing one of the required parameters");
          return response.sendStatus(400);
        }

        const address: string = request.body.address;
        const message: string = request.body.message;
        const signature: string = request.body.signature;
        const network: string = request.body.network;

        functions.logger.info(`
          Starting verification for the following:
          Address: ${address},
          Message: ${message},
          Signature: ${signature},
          Network: ${network}
        `);

        try {
          getAddress(address);
        } catch {
          functions.logger.error("Provider address is not a correct ETH address");
          return response.sendStatus(500);
        }

        let signerAddress;
        /**
         * Verify the signature.
         * There are 2 cases:
         * 1. "Normal" signature
         * 2. The WalletConnect Safe App uses EIP-1271
         */
        try {
          signerAddress = verifyMessage(
            message,
            signature,
          );
        } catch {
          /**
           * Have to set signature manually
           */
          signerAddress = address;
          try {
            const verified = await verifyEIP1271Signature(signerAddress, message, network);

            if (!verified) {
              functions.logger.error(`Debug instructions: 1. address: ${signerAddress}; 2. Message: ${message}`);
              throw new Error();
            }
          } catch {
            functions.logger.error("Could not verify EIP-1271 signature");
            return response.sendStatus(500);
          }
        }

        try {
          getAddress(signerAddress);
        } catch {
          functions.logger.error("Signer address is not a correct ETH address");
          return response.sendStatus(500);
        }

        functions.logger.info("Signer address: ", signerAddress);

        if (signerAddress.toLowerCase() === address.toLowerCase()) {
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
          functions.logger.error("Message was not signed with the claimed address");
          return response.sendStatus(401);
        }

      }),
  ),
};

/**
 * This function is not going to be deployed by CI
 * This function should not be used on production
 */
export const createCustomToken = functions.https.onRequest((request, response) => {
  if (process.env.GCLOUD_PROJECT === "prime-deals-production") {
    functions.logger.error("Trying to access createCustomToken function on production. This function is not intended for production");
    return;
  }

  return cors(request, response, async () => {
    const address: string = request.body.address;
    try {
      getAddress(address);
    } catch {
      functions.logger.error("Signer address is not a correct ETH address");
      return response.sendStatus(500);
    }

    const firebaseToken = await admin.auth().createCustomToken(address);
    return response.status(200).json({ token: firebaseToken });
  });
});

/**
 * Function responsible for running automated Backups.
 * It runs every 60 minutes.
 * It stores backups inside a Google Cloud Storage bucket, specified in `firebaseFunctions/.env` file
 */
export const scheduledFirestoreBackup = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(() => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const bucket = `gs://${process.env.PRIME_BACKUP_BUCKET_NAME}`;
    const databaseName =
    firestoreAdminClient.databasePath(projectId, "(default)");

    functions.logger.log(`
      Trying to create a backup for
      Project ID: ${projectId},
      Database name: ${databaseName},
      Inside a bucket: ${bucket}
    `);

    return firestoreAdminClient.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: [],
    })
      .then(responses => {
        const response = responses[0];
        functions.logger.log(`Creating backup was successful. Operation Name: ${response["name"]}`);
      })
      .catch(err => {
        functions.logger.error(err);
        throw new Error("Creating backup failed");
      });
  });
