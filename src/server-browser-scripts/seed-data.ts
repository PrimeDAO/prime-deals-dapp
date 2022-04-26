import shortUuid from "short-uuid";
import { DealService } from "services/DealService";
import { IDealTokenSwapDocument } from "./../entities/IDealTypes";
import { DefaultTestAddressForSignIn } from "./../../test/data/configuration";
import { firebaseDatabase, signInToFirebase } from "../services/firebase-helpers";
import { collection, doc, writeBatch, getDocs, deleteDoc, addDoc, setDoc } from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";

export const addCollectionAndDocuments = async <T>(
  collectionKey: string,
  arrayOfObjectsToAdd: T[],
) => {
  const collectionRef = collection(firebaseDatabase, collectionKey);
  const batch = writeBatch(firebaseDatabase);
  arrayOfObjectsToAdd.forEach((obj) => {
    const docRef = doc(collectionRef);
    batch.set(docRef, obj);
  });

  return await batch.commit().catch(e => {
    console.log(e);
  });
};

export const clearCollection = async (
  collectionKey: string,
) => {
  const collectionRef = collection(firebaseDatabase, collectionKey);
  const queryResult = await getDocs(collectionRef);
  await Promise.all(queryResult.docs.map(doc => deleteDoc(doc.ref)));
};

export const deleteDocument = (
  collectionKey: string,
  id: string,
) => {
  deleteDoc(doc(firebaseDatabase, collectionKey, id));
};

export const addDocument = (
  collectionKey: string,
  data: Record<string, unknown>,
  dealId?: string,
) => {
  return dealId ?
    setDoc(doc(firebaseDatabase, collectionKey, String(dealId)), data) :
    addDoc(collection(firebaseDatabase, collectionKey), data);
};
try {
  signInToFirebase(DefaultTestAddressForSignIn);
} catch {
  //swallow
}

type ResetDeal = { dealId: string } & IDealRegistrationTokenSwap
export async function resetDeals(registrationData: ResetDeal[] = []) {
  await clearCollection("deals-token-swap");

  await Promise.all(registrationData.map(data => {
    const primaryDaoRepresentativesAddresses = data.primaryDAO?.representatives?.map(item => item.address) ?? [];
    const partnerDaoRepresentativesAddresses = data.partnerDAO?.representatives?.map(item => item.address) ?? [];
    const date = new Date().toISOString();
    const { dealId, ...registrationData } = data;
    const existingOrGeneratedDealId = dealId?? shortUuid.generate();

    const dealData: Partial<IDealTokenSwapDocument> = {
      id: existingOrGeneratedDealId as string,
      registrationData: registrationData,
      createdByAddress: "created-by-test-data",
      createdAt: date,
      modifiedAt: date,
      representativesAddresses: [...primaryDaoRepresentativesAddresses, ...partnerDaoRepresentativesAddresses],
      votingSummary: DealService.initializeVotingSummary(primaryDaoRepresentativesAddresses, partnerDaoRepresentativesAddresses),
      isWithdrawn: false,
      isRejected: false,
    };

    addDocument("deals-token-swap", dealData, dealId as string);
  }));
}

export default resetDeals;
if (module.exports) {
  module.exports.resetDeals = resetDeals;
}
// addCollectionAndDocuments("deals-token-swap", [PRIVATE_PARTNERED_DEAL]);
// deleteDocument("deals-token-swap", "3HWCTLjBvjmcc4K78B36em");

// addCollectionAndDocuments("deals-token-swap", [{ ...PRIVATE_PARTNERED_DEAL, id: "3HWCTLjBvjmcc4K78B36em", terms: "asdfasdasdf" }]);
