import { addDoc, collection, setDoc, doc, query, where, getDocs } from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { firebaseDatabase } from "./FirebaseService";

const dealsCollection = "deals";

export class FirestoreService {
  public async createTokenSwapDeal(registrationData: IDealRegistrationTokenSwap) {
    await addDoc(collection(firebaseDatabase, dealsCollection), {
      registrationData,
      discussions: ["qwe"],
      votes: ["asd"],
    });
  }

  public async updateTokenSwapRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    const dealRef = doc(firebaseDatabase, dealsCollection, dealId);
    setDoc(dealRef, { registrationData }, { merge: true });
  }

  public async getAllPublicDeals() {
    const q = query(collection(firebaseDatabase, dealsCollection), where("registrationData.private", "==", false));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data());
  }
}
