import SafeAppsSDK, { GatewayTransactionDetails, SendTransactionsResponse, TransactionStatus } from "@gnosis.pm/safe-apps-sdk";
import { EthereumService } from "services/EthereumService";
import { ethers } from "ethers";
import { fromEventPattern, Observable } from "rxjs";
import { autoinject } from "aurelia-framework";
import axios from "axios";
import { signInWithCustomToken, setPersistence, signOut, onAuthStateChanged, User, Unsubscribe, UserCredential, browserLocalPersistence } from "firebase/auth";
import { Utils } from "services/utils";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException } from "services/GeneralEvents";
import { FIREBASE_MESSAGE_TO_SIGN } from "./FirestoreTypes";
import { DateService } from "./DateService";
import { BrowserStorageService } from "services/BrowserStorageService";
import { firebaseAuth } from "./firebase-helpers";
import { ConsoleLogService } from "./ConsoleLogService";
import { AlertService } from "./AlertService";

const safeAppOpts = {
  allowedDomains: [/gnosis-safe.io/],
};
const RETRY_SAFE_APP_INTERVAL = 4000;
const RETRY_SAFE_APP_TIMEOUT = 999999;

/**
 * TODO: Should define a new place for this type, and all other `Address` imports should take it from there
 * Cause for change: Want to import app code into Cypress code (, because we want to use the acutal code we are testing).
 * Reason: The other dependencies in `EthereumService` got pulled into Cypress webpack build as well.
 *   And the current Cypress webpack does not support, eg. scss files bundling and processing
 */
 type Address = string;

const FIREBASE_AUTHENTICATION_SIGNATURES_STORAGE = "FIREBASE_AUTHENTICATION_SIGNATURES";

interface ISignatureStorage {
  signature: string;
  messageToSign: string;
  /** Safe App tx for approving authentication to Deals */
  safeTxHash: string;
}

/**
 * Part of the answer in
 * https://stackoverflow.com/questions/71866879/how-to-verify-message-in-wallet-connect-with-ethers-primarily-on-ambire-wallet
 */
function encryptForGnosis(rawMessage: string) {
  const rawMessageLength = new Blob([rawMessage]).size;
  const message = ethers.utils.toUtf8Bytes(
    "\x19Ethereum Signed Message:\n" + rawMessageLength + rawMessage,
  );
  const messageHash = ethers.utils.keccak256(message);
  return messageHash;
}

@autoinject
export class FirebaseService {

  public currentFirebaseUserAddress: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
    private dateService: DateService,
    private browserStorageService: BrowserStorageService,
    private consoleLogService: ConsoleLogService,
    private alertService: AlertService,
  ) {
  }

  public initialize() {
    this.currentFirebaseUserAddress = firebaseAuth?.currentUser?.uid;
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        this.currentFirebaseUserAddress = user.uid;
      } else {
        this.currentFirebaseUserAddress = null;
      }
    });
  }

  /**
   * Signs in to Firebase when a wallet is connected.
   * Signs out from the Firebase when wallet is disconnected
   */
  public syncFirebaseAuthentication(address?: Address) : Promise<boolean> {
    // Checks if address is a valid address (if a wallet was disconnected it will be undefined)
    if (Utils.isAddress(address)) {
      try {
        return this.signInToFirebase(address)
          .then(() => true)
          .catch((error) => {
            this.consoleLogService.logObject(error.message, error, "error");
            this.eventAggregator.publish("handleFailure", "Authentication failed");
            return false;
          });
      } catch (error) {
        this.eventAggregator.publish("handleException", new EventConfigException("An error occurred signing into the database", error));
      }
    } else {
      return signOut(firebaseAuth).then(() => true);
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

  /**
   * Checks if a signature for the provided accountAddress already exists in localStorage
   */
  public hasSignatureForAddress(address: string): boolean {
    return !!this.getExistingSignatureAndMessageForAddress(address).signature;
  }

  private async getMessageToSign(): Promise<string> {
    const date = this.dateService.translateUtcToLocal(new Date());

    return `${FIREBASE_MESSAGE_TO_SIGN} ${date}`;
  }

  private async verifySignedMessageAndCreateCustomToken(address: string, message: string, signature: string): Promise<string> {
    const network = await this.ethereumService.isSafeApp() ? EthereumService.targetedNetwork : undefined;
    const response = await axios.post(`${process.env.FIREBASE_FUNCTIONS_URL}/CI-verifySignedMessageAndCreateCustomToken`, {address, message, signature, network});

    return response.data.token;
  }

  /**
   * Sign in to Firebase with custom token (generated by a Firebase function)
   */
  private async signInWithCustomToken(token: string): Promise<UserCredential> {
    // TODO handle failure
    return signInWithCustomToken(firebaseAuth, token);
  }

  /**
   * Requests custom token for the address from Firebase function and signs in to Firebase
   */
  private async signInToFirebase(address: string): Promise<UserCredential> {
    if (this.currentFirebaseUserAddress === address) {
      return;
    }

    // Signs out from Firebase in case another user was authenticated
    // (could happen when user disconnect and connect a new wallet)
    await signOut(firebaseAuth);

    const { messageToSign, signature, safeTxHash } = await this.getSignatureData(address);
    this.storeSignatureForAddress(address, signature, messageToSign, safeTxHash);

    let token: string;
    try {
      token = await this.verifySignedMessageAndCreateCustomToken(address, messageToSign, signature);
    } catch (error) {
      this.eventAggregator.publish("handleFailure", "Signature wasn't verified successfully");
      throw new Error(error);
    }

    // Firebase Authentication will be persisted in the browser storage (IndexedDB)
    // user will be authenticated to Firebase as long as they don't clear the browser storage
    // (or disconnect their wallet account, or switch to another account which will sign them out)
    await setPersistence(firebaseAuth, browserLocalPersistence);

    // Signs in to Firebase with a given custom token
    return this.signInWithCustomToken(token);
  }

  /**
   * Signature data is generated differently depending on
   * A. Production app
   * B. Safe App
   *
   * For A. generate the message, and take the signature from the wallet provider
   *
   * For B. genreate the message, monitor tx status in the multi-sig queue.
   *   If there is no tx yet, create one.
   *   If tx is ongoing, wait.
   *   If tx successful, generate signature from message (note, signature not in the sense of a private key signature,
   *     but just an encrypted message. We kept the "signature" variable, because validation is still based on a message
   *     and the "signature".)
   */
  private async getSignatureData(address: string) {
    const existingData = this.getExistingSignatureAndMessageForAddress(address);
    let { signature, messageToSign, safeTxHash } = existingData;

    if (signature && messageToSign) {
      return { messageToSign, signature, safeTxHash };
    }

    /** A. Production case */
    if (!(await this.ethereumService.isSafeApp())) {
      try {
        // eslint-disable-next-line require-atomic-updates
        messageToSign = await this.getMessageToSign();
        signature = await this.requestSignature(messageToSign);
        this.eventAggregator.publish("database.account.signature.successful");

      } catch (error) {
        this.eventAggregator.publish("database.account.signature.cancelled");
        throw error;
      }

      return { messageToSign, signature };
    }

    /**
     * B. In case of a Safe App, we follow this flow:
     * 1. Check if there is a queued transaction for authentication
     * 2. Check if already signed
     * 2.1 If yes, generate signature and return
     * 2.2.If not, create tx
     * 3. User waits for confirmation (Note, they may close the app, then repeat 1.)
     */
    const appsSdk = new SafeAppsSDK(safeAppOpts);

    /** 1. */
    const safeTx = await this.processAndGetTransaction(appsSdk, safeTxHash);
    this.consoleLogService.logObject("safeTx", safeTx);

    /**
     * Guard if in queue or done
     */
    if (safeTx?.txStatus === TransactionStatus.SUCCESS) {
      /** 2. */
      const isSigned = await appsSdk.safe.isMessageSigned(messageToSign);

      /** 2.1 */
      if (isSigned) {
        /**
         * Meanwhile, the tx was successful, in this case, generate the signature, and return.
         */
        signature = encryptForGnosis(messageToSign);

        return { messageToSign, signature, safeTxHash };
      }
    } else if (safeTx?.txStatus === TransactionStatus.AWAITING_CONFIRMATIONS || safeTx?.txStatus === TransactionStatus.AWAITING_EXECUTION || safeTx?.txStatus === TransactionStatus.PENDING) {
      return { messageToSign, signature, safeTxHash };
    }

    /** 2.2 */
    try {
      if (!messageToSign) {
        // eslint-disable-next-line require-atomic-updates
        messageToSign = await this.getMessageToSign();
      }

      let response: SendTransactionsResponse;
      try {
        /** 2.1.1 */
        response = await appsSdk.txs.signMessage(messageToSign);
      } catch (error) {
        this.consoleLogService.logMessage("Failed calling signMessage", "error");
        throw error;
      }
      safeTxHash = response.safeTxHash;
      this.consoleLogService.logMessage(`safeTxHash: ${safeTxHash}`);

      /**
       * Extra save, for when user closes app.
       * Note, signature not provided yet.
       */
      this.storeSignatureForAddress(address, "", messageToSign, safeTxHash);

      this.eventAggregator.publish("transaction.sent");

      /**
       * 3. If the user keeps the app open, and because Gnosis Safe is a contract,
       * we will have to query until the tx has finished executing.
       * Only then can we proceed with authenticating to Firebase.
       */
      await Utils.waitUntilTrue(async() => {
        return await appsSdk.safe.isMessageSigned(messageToSign);
      }, RETRY_SAFE_APP_TIMEOUT, RETRY_SAFE_APP_INTERVAL);

      signature = encryptForGnosis(messageToSign);

      this.eventAggregator.publish("transaction.confirmed");
    } catch (error) {
      this.eventAggregator.publish("database.account.signature.cancelled");
      throw error;
    }

    return { messageToSign, signature, safeTxHash };
  }

  /**
   * Inform user with alert if tx is ongoing, then return tx.
   */
  private async processAndGetTransaction(appsSdk: SafeAppsSDK, storedSafeTxHash: string | null): Promise<GatewayTransactionDetails> {
    if (!storedSafeTxHash) return;

    let transaction: GatewayTransactionDetails;
    try {
      transaction = await appsSdk.txs.getBySafeTxHash(storedSafeTxHash);
      if (transaction.txStatus === TransactionStatus.AWAITING_CONFIRMATIONS || transaction.txStatus === TransactionStatus.AWAITING_EXECUTION || transaction.txStatus === TransactionStatus.PENDING) {
        this.alertService.showAlert({
          header: "Awaiting confirmation",
          message: "<p>Transaction has not been approved yet.</p><p>Waiting for confirmation...</p>",
        });
      } else {
        this.consoleLogService.logMessage(`Status of Tx: ${transaction.txStatus}`, "warn");
        this.consoleLogService.logMessage(`Status of Tx: ${transaction}`, "warn");
      }
    } catch (error) {
      this.consoleLogService.logObject(error.message, error, "error");
      throw error;
    }

    return transaction;
  }

  private async requestSignature(messageToSign: string): Promise<string> {
    // Wait up to 30 seconds
    return await Promise.race([
      this.ethereumService.getDefaultSigner().signMessage(messageToSign),
      Utils.timeout(30000),
    ]);
  }

  private getExistingSignatureAndMessageForAddress(address: string): ISignatureStorage {
    const signaturesAndMessages = this.browserStorageService.lsGet<Record<string, ISignatureStorage>>(FIREBASE_AUTHENTICATION_SIGNATURES_STORAGE, {});

    return signaturesAndMessages[address] ? signaturesAndMessages[address] : {signature: null, messageToSign: null, safeTxHash: null};
  }

  private storeSignatureForAddress(address: string, signature: string, messageToSign: string, safeTxHash?: string): void {
    const signaturesAndMessages = this.browserStorageService.lsGet<Record<string, ISignatureStorage>>(FIREBASE_AUTHENTICATION_SIGNATURES_STORAGE, {});

    signaturesAndMessages[address] = {signature, messageToSign, safeTxHash};

    this.browserStorageService.lsSet(FIREBASE_AUTHENTICATION_SIGNATURES_STORAGE, signaturesAndMessages);
  }
}
