import { isEqual } from "lodash";
import { firestore, PARTNER_DAO_VOTES_COLLECTION, PRIMARY_DAO_VOTES_COLLECTION } from "./index";
import { IDealDAOVotingSummary, IDealTokenSwapDocument, IDealVotingSummary } from "../../src/entities/IDealTypes";
import { IFirebaseDocument, DEALS_TOKEN_SWAP_COLLECTION, DEALS_TOKEN_SWAP_UPDATES_COLLECTION, DEEP_DAO_COLLECTION } from "../../src/services/FirestoreTypes";
import { IDeepDaoOrganizations } from "../../src/services/DeepDaoTypes";
import axios from "axios";

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
  delete oldDeal.modifiedAt;
  delete updatedDeal.modifiedAt;

  return isEqual(oldDeal, updatedDeal);
};

/**
 * Checks if registration data was updated
 *
 * Intended to be used inside a callback function triggered on deal document update
 */
export const isRegistrationDataUpdated = (oldDeal: IDealTokenSwapDocument, updatedDeal: IDealTokenSwapDocument): boolean => {
  const oldDealRegistrationData = JSON.parse(JSON.stringify(oldDeal.registrationData));
  const updatedDealRegistrationData = JSON.parse(JSON.stringify(updatedDeal.registrationData));

  return !isEqual(oldDealRegistrationData, updatedDealRegistrationData);
};

/**
 * Checks if the only update to the deal document was the modifiedAt field
 */
export const isModifiedAtOnlyUpdate = (oldDeal: IDealTokenSwapDocument, updatedDeal: IDealTokenSwapDocument): boolean => {
  oldDeal = JSON.parse(JSON.stringify(oldDeal));
  updatedDeal = JSON.parse(JSON.stringify(updatedDeal));
  delete oldDeal.modifiedAt;
  delete updatedDeal.modifiedAt;

  return isEqual(oldDeal, updatedDeal);
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
      totalSubmittable: primaryDaoRepresentativesAddresses.length,
      acceptedVotesCount: 0,
      rejectedVotesCount: 0,
      votes: Object.assign({}, ...primaryDaoRepresentativesAddresses.map(address => ({[address]: null}))),
    },
    partnerDAO: {
      totalSubmittable: partnerDaoRepresentativesAddresses.length,
      acceptedVotesCount: 0,
      rejectedVotesCount: 0,
      votes: Object.assign({}, ...partnerDaoRepresentativesAddresses.map(address => ({[address]: null}))),
    },
    totalSubmittable: primaryDaoRepresentativesAddresses.length + partnerDaoRepresentativesAddresses.length,
    totalSubmitted: 0,
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
    totalSubmittable: primaryDAO.totalSubmittable + partnerDAO.totalSubmittable,
    totalSubmitted: primaryDAO.acceptedVotesCount + primaryDAO.rejectedVotesCount + partnerDAO.acceptedVotesCount + partnerDAO.rejectedVotesCount,
  };
};

/**
 * Updates deal updates collection
 */
export const updateDealUpdatesCollection = (dealId: string): void => {
  const modifiedAt = new Date().toISOString();
  firestore.collection(DEALS_TOKEN_SWAP_UPDATES_COLLECTION).doc(dealId).set({
    dealId,
    modifiedAt,
  });
};

/**
 * Imports list of DAO's (Organizations) from DeepDAO API, and stores a map
 * of organizations data inside a Google FireStore collection - `deep-dao`.
 * The API-Url and API-Key are specified in `firebaseFunctions/.env` file
 */
// eslint-disable-next-line
export const deepDaoOrganizationListUpdate = async (firestoreAdminClient: any, functions: any): Promise<FirebaseFirestore.WriteResult> =>
{
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName =
    firestoreAdminClient.databasePath(projectId, "(default)");

  functions.logger.log(`
      Starting daily update for DeepDAO organizations list
      Project ID: ${projectId},
      Database name: ${databaseName},
    `);

  let res: IDeepDaoOrganizations;

  try {
    res = await (await axios.get(`${process.env.DEEPDAO_API_URL}/organizations`, {
      headers: {
        "mode": "cors",
        "Content-Type": "application/json",
        "x-api-key": `${process.env.DEEPDAO_API_KEY}`,
      },
    })).data.data;
    functions.logger.log(`Retrived successfully ${res.totalResources} organizations.`);
  } catch (err) {
    functions.logger.log(`
      Error fetching DeepDAO organizations.
      Error message: ${err.message}.
    `);
    return;
  }

  try {
    // Converting DAO array into slim object
    const extractAddresses = (obj: any): FirebaseFirestore.WriteResult =>
    {
      return obj.reduce((addresses, { address }) =>
      {
        addresses.push(address);
        return addresses;
      }, []);
    };

    const orgs = res.resources.reduce((obj, item): FirebaseFirestore.DocumentData =>
    {
      obj[item.organizationId] = {
        name: item.name,
        avatarUrl: item.logo,
        treasuryAddresses: item.governance ? extractAddresses(item.governance) : [],
      };
      return obj;
    }, {} as FirebaseFirestore.CollectionGroup<FirebaseFirestore.DocumentData>);

    functions.logger.log(`Mapped successfully ${Object.keys(orgs).length} organizations.`);
    let batch = firestore.batch();
    let idx = 0;
    for (const [id, org] of Object.entries(orgs)) {
      const docRef = firestore.collection(DEEP_DAO_COLLECTION).doc(id); //automatically generate unique id
      batch.set(docRef, org);
      idx++;
      /**
       * Batches can commit max 500 docs per request.
       * Once a batch is full, it gets committed and
       * a new one is created.
       * */
      if (idx % 500 === 0) {
        await batch.commit();
        batch = firestore.batch();
      }
    }
    await batch.commit();
    functions.logger.log(`Firebase 'deep-dao' collection updated successfully ${Object.keys(orgs).length} organizations.`);
    return;
  } catch (err) {
    functions.logger.log(`
      Error mapping DeepDAO organizations.
      Error message: ${err.message}.
    `);
    return;
  }
};

/**
 * Builds an object with a voting summary for a DAO
 */
const getDaoVotingSummary = (daoVotes: Array<IFirebaseDocument<{vote: boolean}>>): IDealDAOVotingSummary => {
  return {
    totalSubmittable: daoVotes.length,
    acceptedVotesCount: daoVotes.filter(vote => vote.data.vote).length,
    rejectedVotesCount: daoVotes.filter(vote => vote.data.vote === false).length,
    votes: Object.assign({}, ...daoVotes.map(vote => ({[vote.id]: vote.data.vote}))),
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
