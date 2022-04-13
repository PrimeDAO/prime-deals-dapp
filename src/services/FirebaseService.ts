import { fromEventPattern, Observable } from "rxjs";
import { autoinject } from "aurelia-framework";
import { signOut, onAuthStateChanged, User, Unsubscribe } from "firebase/auth";
import { Utils } from "../services/utils";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException } from "../services/GeneralEvents";
import { signInToFirebase, firebaseAuth } from "./firebase-helpers";

/**
 * TODO: Should define a new place for this type, and all other `Address` imports should take it from there
 * Cause for change: Want to import app code into Cypress code (, because we want to use the acutal code we are testing).
 * Reason: The other dependencies in `EthereumService` got pulled into Cypress webpack build as well.
 *   And the current Cypress webpack does not support, eg. scss files bundling and processing
 */
 type Address = string;

@autoinject
export class FirebaseService {

  public authenticationIsSynced = true;

  constructor(
    private eventAggregator: EventAggregator,
  ) {
  }

  public initialize(): void {
    this.eventAggregator.subscribe("Network.Changed.Account", (address: Address) => {
      this.syncFirebaseAuthentication(address);
    });
  }

  /**
   * Signs in to Firebase when a wallet is connected.
   * Signs out from the Firebase when wallet is disconnected
   */
  public syncFirebaseAuthentication(address?: Address): Promise<boolean> {
    this.authenticationIsSynced = false;
    // Checks if address is a valid address (if a wallet was disconnected it will be undefined)
    if (Utils.isAddress(address)) {
      try {
        return signInToFirebase(address).then(() => this.authenticationIsSynced = true);
      } catch (error) {
        this.eventAggregator.publish("handleException", new EventConfigException("An error occurred signing into the database", error));
      }
    } else {
      return signOut(firebaseAuth).then(() => this.authenticationIsSynced = true);
    }
  }

  /**
   * Firebase authentication state Observable
   * Turns Firebase onAuthStateChanged method into an Observable
   */
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
}
