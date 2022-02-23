import { autoinject } from "aurelia-framework";
import { collection, addDoc, getDocs, getFirestore, query, updateDoc } from "firebase/firestore";

const db = getFirestore();
const DEALS_COLLECTION = "deals";

@autoinject
export class FirestoreService {
  public dealsCollectionQuery = query(collection(db, DEALS_COLLECTION));

  public async addItem(obj: object) {
    try {
      const docRef = await addDoc(collection(db, DEALS_COLLECTION), obj);

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  public async editItem(ref: any, obj: object) {
    await updateDoc(ref, obj);
  }

  public async getAllPublicDeals() {
    return (await getDocs(collection(db, DEALS_COLLECTION))).docs.map(doc => doc.data());
  }
}
