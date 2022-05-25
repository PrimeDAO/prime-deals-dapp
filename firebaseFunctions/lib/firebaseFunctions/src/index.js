"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledFirestoreBackup = exports.createCustomToken = exports.CI = exports.PARTNER_DAO_VOTES_COLLECTION = exports.PRIMARY_DAO_VOTES_COLLECTION = exports.firestore = void 0;
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const googleCloudFirestore = require("@google-cloud/firestore");
const corsLib = require("cors");
const shortUuid = require("short-uuid");
const utils_1 = require("ethers/lib/utils");
const helpers_1 = require("./helpers");
const FirestoreTypes_1 = require("../../src/services/FirestoreTypes");
const firestoreAdminClient = new googleCloudFirestore.v1.FirestoreAdminClient();
const admin = firebaseAdmin.initializeApp();
exports.firestore = admin.firestore();
exports.PRIMARY_DAO_VOTES_COLLECTION = "primary-dao-votes";
exports.PARTNER_DAO_VOTES_COLLECTION = "partner-dao-votes";
const cors = corsLib({
    origin: true,
});
exports.CI = {
    onDealCreate: functions.firestore
        .document(`${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/{dealId}`)
        .onCreate((snapshot) => {
        helpers_1.updateDealUpdatesCollection(snapshot.id);
    }),
    updateDealStructure: functions.firestore
        .document(`${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/{dealId}`)
        .onUpdate(async (change, context) => {
        const dealId = context.params.dealId;
        const oldDeal = change.before.data();
        const updatedDeal = change.after.data();
        if (!updatedDeal || helpers_1.isModifiedAtOnlyUpdate(oldDeal, updatedDeal)) {
            return;
        }
        helpers_1.updateDealUpdatesCollection(dealId);
        const batch = exports.firestore.batch();
        const dealUpdates = {};
        if (helpers_1.isRegistrationDataUpdated(oldDeal, updatedDeal) &&
            !helpers_1.isRegistrationDataPrivacyOnlyUpdate(oldDeal, updatedDeal)) {
            const primaryDaoRepresentativesAddresses = updatedDeal.registrationData.primaryDAO.representatives.map(item => item.address);
            const partnerDaoRepresentativesAddresses = updatedDeal.registrationData.partnerDAO ? updatedDeal.registrationData.partnerDAO.representatives.map(item => item.address) : [];
            await helpers_1.resetVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
            dealUpdates.representativesAddresses = [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses];
            dealUpdates.votingSummary = helpers_1.initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
        }
        batch.set(change.after.ref, dealUpdates, { merge: true });
        return batch.commit();
    }),
    onVoteUpdate: functions.firestore
        .document(`${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/{dealId}/{collection}/{representativeAddress}`)
        .onUpdate(async (change, context) => {
        const dealSubcollection = context.params.collection;
        if (dealSubcollection !== exports.PRIMARY_DAO_VOTES_COLLECTION && dealSubcollection !== exports.PARTNER_DAO_VOTES_COLLECTION) {
            return;
        }
        const dealId = context.params.dealId;
        const batch = exports.firestore.batch();
        const dealRef = exports.firestore.doc(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}`);
        const votingSummary = await helpers_1.generateVotingSummary(dealId);
        batch.set(dealRef, {
            votingSummary,
        }, { merge: true });
        return batch.commit();
    }),
    createDeal: functions.https.onRequest((request, response) => cors(request, response, async () => {
        if (request.method !== "POST") {
            return response.sendStatus(403);
        }
        if (!request.body.registrationData) {
            return response.sendStatus(400);
        }
        functions.logger.log("Check if request is authorized with Firebase ID token");
        if ((!request.headers.authorization || !request.headers.authorization.startsWith("Bearer "))) {
            functions.logger.error("No Firebase ID token was passed as a Bearer token in the Authorization header.", "Make sure you authorize your request by providing the following HTTP header:", "Authorization: Bearer <Firebase ID Token>");
            return response.sendStatus(403);
        }
        functions.logger.log("Found \"Authorization\" header");
        const idToken = request.headers.authorization.split("Bearer ")[1];
        let decodedIdToken;
        try {
            decodedIdToken = await admin.auth().verifyIdToken(idToken);
            functions.logger.log("ID Token correctly decoded", decodedIdToken);
        }
        catch (error) {
            functions.logger.error("Error while verifying Firebase ID token:", error);
            return response.sendStatus(403);
        }
        const registrationData = request.body.registrationData;
        const primaryDaoRepresentativesAddresses = registrationData.primaryDAO.representatives.map(item => item.address);
        const partnerDaoRepresentativesAddresses = registrationData.partnerDAO ? registrationData.partnerDAO.representatives.map(item => item.address) : [];
        const dealId = shortUuid.generate();
        const date = new Date().toISOString();
        const dealData = {
            id: dealId,
            registrationData,
            createdByAddress: decodedIdToken.uid,
            createdAt: date,
            modifiedAt: date,
            representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
            votingSummary: helpers_1.initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
            isWithdrawn: false,
            isRejected: false,
        };
        const batch = exports.firestore.batch();
        const dealRef = exports.firestore.doc(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}`);
        batch.set(dealRef, dealData);
        helpers_1.initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
        try {
            await batch.commit();
            const deal = (await dealRef.get()).data();
            return response.status(200).send(deal);
        }
        catch (error) {
            functions.logger.error("Error while creating a deal:", error);
            return response.sendStatus(500);
        }
    })),
    verifySignedMessageAndCreateCustomToken: functions.https.onRequest((request, response) => cors(request, response, async () => {
        if (request.method !== "POST") {
            return response.sendStatus(403);
        }
        if (!request.body.address || !request.body.message || !request.body.signature) {
            functions.logger.error("missing one of the required parameters");
            return response.sendStatus(400);
        }
        const address = request.body.address;
        const message = request.body.message;
        const signature = request.body.signature;
        functions.logger.info(`
          Starting verification for the following:
          Address: ${address},
          Message: ${message},
          Signature: ${signature}
        `);
        try {
            utils_1.getAddress(address);
        }
        catch {
            functions.logger.error("Provider address is not a correct ETH address");
            return response.sendStatus(500);
        }
        const signerAddress = utils_1.verifyMessage(message, signature);
        try {
            utils_1.getAddress(signerAddress);
        }
        catch {
            functions.logger.error("Signer address is not a correct ETH address");
            return response.sendStatus(500);
        }
        functions.logger.info("Signer address: ", signerAddress);
        if (signerAddress.toLowerCase() === address.toLowerCase()) {
            try {
                const firebaseToken = await admin.auth().createCustomToken(address);
                return response.status(200).json({ token: firebaseToken });
            }
            catch (error) {
                functions.logger.error("createCustomToken error:", error);
                return response.sendStatus(500);
            }
        }
        else {
            functions.logger.error("Message was not signed with the claimed address");
            return response.sendStatus(401);
        }
    })),
};
exports.createCustomToken = functions.https.onRequest((request, response) => {
    if (process.env.GCLOUD_PROJECT === "prime-deals-production") {
        functions.logger.error("Trying to access createCustomToken function on production. This function is not intended for production");
        return;
    }
    return cors(request, response, async () => {
        const address = request.body.address;
        try {
            utils_1.getAddress(address);
        }
        catch {
            functions.logger.error("Signer address is not a correct ETH address");
            return response.sendStatus(500);
        }
        const firebaseToken = await admin.auth().createCustomToken(address);
        return response.status(200).json({ token: firebaseToken });
    });
});
exports.scheduledFirestoreBackup = functions.pubsub
    .schedule("every 60 minutes")
    .onRun(() => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const bucket = `gs://${process.env.PRIME_BACKUP_BUCKET_NAME}`;
    const databaseName = firestoreAdminClient.databasePath(projectId, "(default)");
    functions.logger.log(`
      Trying to create a backup for
      Project ID: ${projectId},
      Database name: ${databaseName},
      Inside a bucket: ${bucket}
    `);
    return firestoreAdminClient.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
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
//# sourceMappingURL=index.js.map