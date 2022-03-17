import { isEqual } from "lodash";
import { DEALS_COLLECTION, firestore, PARTNER_DAO_VOTES_COLLECTION, PRIMARY_DAO_VOTES_COLLECTION } from "./index";
import { IDAOVotingSummary, IFirebaseDocument, ITokenSwapDeal, IVotingSummary } from "./types";

export const isRegistrationDataPrivacyOnlyUpdate = (oldDeal: ITokenSwapDeal, updatedDeal: ITokenSwapDeal): boolean => {
  const oldDealRegistrationData = JSON.parse(JSON.stringify(oldDeal.registrationData));
  const updatedDealRegistrationData = JSON.parse(JSON.stringify(updatedDeal.registrationData));
  delete oldDealRegistrationData.isPrivate;
  delete updatedDealRegistrationData.isPrivate;

  return isEqual(oldDealRegistrationData, updatedDealRegistrationData);
};

export const isRegistrationDataUpdated = (oldDeal: ITokenSwapDeal, updatedDeal: ITokenSwapDeal): boolean => {
  return !isEqual(oldDeal.registrationData, updatedDeal.registrationData);
};

export const updateRepresentativesAndVotes = async (
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): Promise<void> => {
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
};

export const initializeVotes = (
  batch: FirebaseFirestore.WriteBatch,
  dealId: string,
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): void => {
  primaryDaoRepresentativesAddresses.forEach(address => {
    const voteRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(voteRef, {vote: null});
  });

  partnerDaoRepresentativesAddresses.forEach(address => {
    const voteRef = firestore.doc(`/${DEALS_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}/${address}`);
    batch.set(voteRef, {vote: null});
  });
};

// update voting summary object

// run on deal create/update
export const initializeVotingSummary = (
  primaryDaoRepresentativesAddresses: string[],
  partnerDaoRepresentativesAddresses: string[],
): IVotingSummary => {
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

// run on vote update
export const generateVotingSummary = async (dealId: string): Promise<IVotingSummary> => {
  const votes = await Promise.all([
    firestore.collection(`/${DEALS_COLLECTION}/${dealId}/${PRIMARY_DAO_VOTES_COLLECTION}`).get(),
    firestore.collection(`/${DEALS_COLLECTION}/${dealId}/${PARTNER_DAO_VOTES_COLLECTION}`).get(),
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

export const getDaoVotingSummary = (daoVotes: Array<IFirebaseDocument<{vote: boolean}>>): IDAOVotingSummary => {
  return {
    total: daoVotes.length,
    accepted: daoVotes.filter(vote => vote.data.vote).length,
    rejected: daoVotes.filter(vote => vote.data.vote === false).length,
    votes: daoVotes.map(vote => ({address: vote.id, vote: vote.data.vote})),
  };
};

export const getDocumentsFromQuerySnapshot = (querySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): Array<IFirebaseDocument> => {
  return querySnapshot.docs.filter(doc => doc.exists).map(doc => ({
    id: doc.id,
    data: doc.data(),
  }));
};
