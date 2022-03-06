import { autoinject } from "aurelia-framework";
import axios from "axios";
import { getApp } from "firebase/app";
import { getAuth, signInWithCustomToken, connectAuthEmulator, setPersistence, inMemoryPersistence, signOut } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { Utils } from "services/utils";
import { EthereumService } from "services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";

export const firebaseApp = getApp();
export const firebaseDatabase = getFirestore();
export const firebaseAuth = getAuth();
export const firebaseFunctions = getFunctions(firebaseApp);

if (process.env.FIREBASE_ENVIRONMENT === "local") {
  connectFirestoreEmulator(firebaseDatabase, "localhost", 8080);
  connectAuthEmulator(firebaseAuth, "http://localhost:9099");
  connectFunctionsEmulator(firebaseFunctions, "localhost", 5001);
}

@autoinject
export class FirebaseService {

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
  ) {
    this.eventAggregator.subscribe("Network.Changed.Account", address => {
      if (Utils.isAddress(address)) {
        this.signInToFirebase(address);
      } else {
        signOut(firebaseAuth);
      }
    });
  }

  async add() {
    await setDoc(doc(firebaseDatabase, "test", `${Math.random()}`), {
      name: "Test document",
      random: `${Math.random()}`,
    });
  }

  private async createCustomToken(address: string): Promise<string> {
    const response = await axios.post(`${process.env.FIREBASE_FUNCTIONS_URL}/createCustomToken`, {address});

    return response.data.token;
  }

  private async signInWithCustomToken(token: string): Promise<void> {
    await signInWithCustomToken(firebaseAuth, token);
  }

  private async signInToFirebase(address: string): Promise<void> {
    const token = await this.createCustomToken(address);

    await setPersistence(firebaseAuth, inMemoryPersistence);
    await this.signInWithCustomToken(token);
  }
}
