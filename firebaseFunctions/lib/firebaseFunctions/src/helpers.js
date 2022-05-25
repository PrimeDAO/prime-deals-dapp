"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDealUpdatesCollection = exports.generateVotingSummary = exports.initializeVotingSummary = exports.initializeVotes = exports.resetVotes = exports.isModifiedAtOnlyUpdate = exports.isRegistrationDataUpdated = exports.isRegistrationDataPrivacyOnlyUpdate = void 0;
const lodash_1 = require("lodash");
const index_1 = require("./index");
const FirestoreTypes_1 = require("../../src/services/FirestoreTypes");
exports.isRegistrationDataPrivacyOnlyUpdate = (oldDeal, updatedDeal) => {
    oldDeal = JSON.parse(JSON.stringify(oldDeal));
    updatedDeal = JSON.parse(JSON.stringify(updatedDeal));
    delete oldDeal.registrationData.isPrivate;
    delete updatedDeal.registrationData.isPrivate;
    delete oldDeal.modifiedAt;
    delete updatedDeal.modifiedAt;
    return lodash_1.isEqual(oldDeal, updatedDeal);
};
exports.isRegistrationDataUpdated = (oldDeal, updatedDeal) => {
    const oldDealRegistrationData = JSON.parse(JSON.stringify(oldDeal.registrationData));
    const updatedDealRegistrationData = JSON.parse(JSON.stringify(updatedDeal.registrationData));
    return !lodash_1.isEqual(oldDealRegistrationData, updatedDealRegistrationData);
};
exports.isModifiedAtOnlyUpdate = (oldDeal, updatedDeal) => {
    oldDeal = JSON.parse(JSON.stringify(oldDeal));
    updatedDeal = JSON.parse(JSON.stringify(updatedDeal));
    delete oldDeal.modifiedAt;
    delete updatedDeal.modifiedAt;
    return lodash_1.isEqual(oldDeal, updatedDeal);
};
exports.resetVotes = async (batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses) => {
    const votes = await Promise.all([
        index_1.firestore.collection(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PRIMARY_DAO_VOTES_COLLECTION}`).listDocuments(),
        index_1.firestore.collection(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PARTNER_DAO_VOTES_COLLECTION}`).listDocuments(),
    ]);
    votes.forEach(daoVotes => {
        daoVotes.forEach(voteRef => {
            batch.delete(voteRef);
        });
    });
    exports.initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
};
exports.initializeVotes = (batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses) => {
    primaryDaoRepresentativesAddresses.forEach(address => {
        const voteRef = index_1.firestore.doc(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PRIMARY_DAO_VOTES_COLLECTION}/${address}`);
        batch.set(voteRef, { vote: null });
    });
    partnerDaoRepresentativesAddresses.forEach(address => {
        const voteRef = index_1.firestore.doc(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PARTNER_DAO_VOTES_COLLECTION}/${address}`);
        batch.set(voteRef, { vote: null });
    });
};
exports.initializeVotingSummary = (primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses) => {
    return {
        primaryDAO: {
            totalSubmittable: primaryDaoRepresentativesAddresses.length,
            acceptedVotesCount: 0,
            rejectedVotesCount: 0,
            votes: Object.assign({}, ...primaryDaoRepresentativesAddresses.map(address => ({ [address]: null }))),
        },
        partnerDAO: {
            totalSubmittable: partnerDaoRepresentativesAddresses.length,
            acceptedVotesCount: 0,
            rejectedVotesCount: 0,
            votes: Object.assign({}, ...partnerDaoRepresentativesAddresses.map(address => ({ [address]: null }))),
        },
        totalSubmittable: primaryDaoRepresentativesAddresses.length + partnerDaoRepresentativesAddresses.length,
        totalSubmitted: 0,
    };
};
exports.generateVotingSummary = async (dealId) => {
    const votes = await Promise.all([
        index_1.firestore.collection(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PRIMARY_DAO_VOTES_COLLECTION}`).get(),
        index_1.firestore.collection(`/${FirestoreTypes_1.DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${index_1.PARTNER_DAO_VOTES_COLLECTION}`).get(),
    ]);
    const primaryDAOVotes = getDocumentsFromQuerySnapshot(votes[0]);
    const partnerDAOVotes = getDocumentsFromQuerySnapshot(votes[1]);
    const primaryDAO = getDaoVotingSummary(primaryDAOVotes);
    const partnerDAO = getDaoVotingSummary(partnerDAOVotes);
    return {
        primaryDAO,
        partnerDAO,
        totalSubmittable: primaryDAO.totalSubmittable + partnerDAO.totalSubmittable,
        totalSubmitted: primaryDAO.acceptedVotesCount + primaryDAO.rejectedVotesCount + partnerDAO.acceptedVotesCount + partnerDAO.rejectedVotesCount,
    };
};
exports.updateDealUpdatesCollection = (dealId) => {
    const modifiedAt = new Date().toISOString();
    index_1.firestore.collection(FirestoreTypes_1.DEALS_TOKEN_SWAP_UPDATES_COLLECTION).doc(dealId).set({
        dealId,
        modifiedAt,
    });
};
const getDaoVotingSummary = (daoVotes) => {
    return {
        totalSubmittable: daoVotes.length,
        acceptedVotesCount: daoVotes.filter(vote => vote.data.vote).length,
        rejectedVotesCount: daoVotes.filter(vote => vote.data.vote === false).length,
        votes: Object.assign({}, ...daoVotes.map(vote => ({ [vote.id]: vote.data.vote }))),
    };
};
const getDocumentsFromQuerySnapshot = (querySnapshot) => {
    return querySnapshot.docs.filter(doc => doc.exists).map(doc => ({
        id: doc.id,
        data: doc.data(),
    }));
};
//# sourceMappingURL=helpers.js.map