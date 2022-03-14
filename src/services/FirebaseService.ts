import { fromEventPattern, Observable } from "rxjs";
import { autoinject } from "aurelia-framework";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, connectAuthEmulator, setPersistence, inMemoryPersistence, signOut, onAuthStateChanged, User, Unsubscribe } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { Utils } from "services/utils";
import { EventAggregator } from "aurelia-event-aggregator";

export const firebaseApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
});

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
  ) {}

  public initializeFirebaseAuthentication() {
    this.eventAggregator.subscribe("Network.Changed.Account", (address: string) => {
      if (Utils.isAddress(address)) {
        // maybe check if user in not yet signed in with another address. But not sure if that's necessary
        // as signInToFirebase will probably already invalidated previous session
        this.signInToFirebase(address);
      } else {
        signOut(firebaseAuth);
      }
    });
  }

  public authStateChanged(): Observable<User> {
    return fromEventPattern(
      (handler) => onAuthStateChanged(firebaseAuth, (user) => {
        handler(user);
      }),
      (handler, unsubscribe: Unsubscribe) => {
        unsubscribe();
      },
    );
  }

  private async createCustomToken(address: string): Promise<string> {
    const response = await axios.post(`${process.env.FIREBASE_FUNCTIONS_URL}/createCustomToken`, {address});

    return response.data.token;
  }

  private async signInWithCustomToken(token: string): Promise<void> {
    await signInWithCustomToken(firebaseAuth, token);
  }

  private async signInToFirebase(address: string): Promise<void> {
    await signOut(firebaseAuth);
    const token = await this.createCustomToken(address);

    await setPersistence(firebaseAuth, inMemoryPersistence);
    await this.signInWithCustomToken(token);
  }
}
