import { isEqual } from "lodash";
import { firestore, PARTNER_DAO_VOTES_COLLECTION, PRIMARY_DAO_VOTES_COLLECTION } from "./index";
import { IDealDAOVotingSummary, IDealTokenSwapDocument, IDealVotingSummary } from "../../src/entities/IDealSharedTypes";
import { IFirebaseDocument, DEALS_TOKEN_SWAP_COLLECTION } from "../../src/services/FirestoreTypes";

/**
 * Checks if the only change to the deal is isPrivacy flag change
 *
 * Intended to be used inside a callback function triggered on deal document update
 */
export const isRegistrationDataPrivacyOnlyUpdate = (oldDeal: IDealTokenSwapDocument, updatedDeal: IDealTokenSwapDocument): boolean => {
  oldDeal = JSON.parse(JSON.stringify(oldDeal));
  updatedDeal = JSON.parse(JSON.stringify(updatedDeal));
  delete oldDeal.registrationData.isPrivate;
  delete updatedDeal.registrationData.isPrivate;
  delete oldDeal.registrationData.modifiedAt;
  delete updatedDeal.registrationData.modifiedAt;

  return isEqual(oldDeal, updatedDeal);
};

/**
 * Checks if registration data was updated (any part of it apart from modifiedAt field)
 *
 * Intended to be used inside a callback function triggered on deal document update
 */
export const isRegistrationDataUpdated = (oldDeal: IDealTokenSwapDocument, updatedDeal: IDealTokenSwapDocument): boolean => {
  const oldDealRegistrationData = JSON.parse(JSON.stringify(oldDeal.registrationData));
  const updatedDealRegistrationData = JSON.parse(JSON.stringify(updatedDeal.registrationData));
  delete oldDealRegistrationData.modifiedAt;
  delete updatedDealRegistrationData.modifiedAt;

  return !isEqual(oldDealRegistrationData, updatedDealRegistrationData);
};

/**
 * Adds delete operations for existing votes to the given batch
 *
 * Adds set operations to initialize new votes to the given batch
 *
 * Deletes existing votes and initializes empty votes for all representatives
 */
export const resetVotes = async (
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): Promise<void> => {
  // delete current votes
  const votes = await Promise.all([
    firestore.collection(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}`).listDocuments(),
    firestore.collection(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}`).listDocuments(),
  ]);

  votes.forEach(daoVotes => {
    daoVotes.forEach(voteRef => {
      batch.delete(voteRef);
    });
  });

  // initialize new votes
  initializeVotes(batch, dealId, primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses);
};

/**
 * Adds set operations to the given batch
 *
 * Creates vote documents for each representative and set them to null (not voted)
 *
 * There are two collections of votes, one for each DAO
 * Having two separate collections gives us more flexibility and we don't need to store additional info about the DAO
 */
export const initializeVotes = (
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): void => {
  primaryDaoRepresentativesAddresses.forEach(address => {
    const voteRef = firestore.doc(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(voteRef, {vote: null});
  });

  partnerDaoRepresentativesAddresses.forEach(address => {
    const voteRef = firestore.doc(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(voteRef, {vote: null});
  });
};

/**
 * Initializes the voting summary object with default values
 *
 * Used to create an initial voting summary as well as to reset the existing one
 */
export const initializeVotingSummary = (
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): IDealVotingSummary => {
  return {
    primaryDAO: {
      total: primaryDaoRepresentativesAddresses.length,
      accepted: 0,
      rejected: 0,
      votes: primaryDaoRepresentativesAddresses.map(address => ({address, vote: null})),
    },
    partnerDAO: {
      total: partnerDaoRepresentativesAddresses.length,
      accepted: 0,
      rejected: 0,
      votes: partnerDaoRepresentativesAddresses.map(address => ({address, vote: null})),
    },
    total: primaryDaoRepresentativesAddresses.length + partnerDaoRepresentativesAddresses.length,
    votesGiven: 0,
  };
};

/**
 * Generates voting summary based on current votes. Reads current votes.
 *
 * Used to recalculate voting summary after a vote is updated
 */
export const generateVotingSummary = async (dealId: string): Promise<IDealVotingSummary> => {
  const votes = await Promise.all([
    firestore.collection(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}`).get(),
    firestore.collection(`/${DEALS_TOKEN_SWAP_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}`).get(),
  ]);
  const primaryDAOVotes: Array<IFirebaseDocument<{vote: boolean}>> = getDocumentsFromQuerySnapshot(votes[0]);
  const partnerDAOVotes: Array<IFirebaseDocument<{vote: boolean}>> = getDocumentsFromQuerySnapshot(votes[1]);

  const primaryDAO = getDaoVotingSummary(primaryDAOVotes);
  const partnerDAO = getDaoVotingSummary(partnerDAOVotes);

  return {
    primaryDAO,
    partnerDAO,
    total: primaryDAO.total + partnerDAO.total,
    votesGiven: primaryDAO.accepted + primaryDAO.rejected + partnerDAO.accepted + partnerDAO.rejected,
  };
};

/**
 * Builds an object with a voting summary for a DAO
 */
const getDaoVotingSummary = (daoVotes: Array<IFirebaseDocument<{vote: boolean}>>): IDealDAOVotingSummary => {
  return {
    total: daoVotes.length,
    accepted: daoVotes.filter(vote => vote.data.vote).length,
    rejected: daoVotes.filter(vote => vote.data.vote === false).length,
    votes: daoVotes.map(vote => ({address: vote.id, vote: vote.data.vote})),
  };
};

/**
 * Turns querySnapshot into a collection of objects with id and data fields
 */
const getDocumentsFromQuerySnapshot = (querySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): Array<IFirebaseDocument> => {
  return querySnapshot.docs.filter(doc => doc.exists).map(doc => ({
    id: doc.id,
    data: doc.data(),
  }));
};
