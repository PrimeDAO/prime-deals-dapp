import { autoinject } from "aurelia-framework";
import axios from "axios";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from "firebase/firestore";

export const firestoreDatabase = getFirestore();
export const firebaseAuth = getAuth();

if (process.env.FIREBASE_ENVIRONMENT === "emulator") {
  connectFirestoreEmulator(firestoreDatabase, "localhost", 8080);
}

@autoinject
export class FirebaseService {
  async add() {
    await setDoc(doc(firestoreDatabase, "test", `${Math.random()}`), {
      name: "Test document",
      random: `${Math.random()}`,
    });
  }

  public async createCustomToken(address: string): Promise<string> {
    const response = await axios.post(`${process.env.FIREBASE_FUNCTIONS_URL}/createCustomToken`, {address});

    return response.data.token;
  }

  public async signInWithCustomToken(token: string): Promise<void> {
    await signInWithCustomToken(firebaseAuth, token);
  }
}
