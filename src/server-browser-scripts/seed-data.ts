import { jsonDocs } from "../../test/data/index";
import { firebaseDatabase, signInToFirebase } from "../services/firebase-helpers";
import { collection, doc, writeBatch, getDocs, deleteDoc, addDoc, setDoc } from "firebase/firestore";

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
) => {
  const { dealId, ...correctedData } = data;
  return dealId ?
    setDoc(doc(firebaseDatabase, collectionKey, String(dealId)), correctedData) :
    addDoc(collection(firebaseDatabase, collectionKey), correctedData);
};

signInToFirebase("0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498");

export async function resetDeals() {
  await clearCollection("deals-token-swap");

  await Promise.all(jsonDocs.map(y => {
    addDocument("deals-token-swap", y);
  }));
}

export default resetDeals;
module.exports.resetDeals = resetDeals;
// addCollectionAndDocuments("deals-token-swap", [PRIVATE_PARTNERED_DEAL]);
// deleteDocument("deals-token-swap", "3HWCTLjBvjmcc4K78B36em");

// addCollectionAndDocuments("deals-token-swap", [{ ...PRIVATE_PARTNERED_DEAL, id: "3HWCTLjBvjmcc4K78B36em", terms: "asdfasdasdf" }]);
