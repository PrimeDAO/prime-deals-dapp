import { autoinject } from "aurelia-framework";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { collection, addDoc, getDocs, getFirestore, query, updateDoc } from "firebase/firestore";
import axios from "axios";
import { EthereumService } from "services/EthereumService";

const db = getFirestore();
const DEALS_COLLECTION = "deals";
const CLOUD_FUNCTIONS_URL = "https://us-central1-deals-poc.cloudfunctions.net";
// const CLOUD_FUNCTIONS_URL = "http://localhost:5001/deals-poc/us-central1";
// const getNonceToSign = "https://us-central1-deals-poc.cloudfunctions.net/getNonceToSign";
// const verifySignedMessage = "https://us-central1-deals-poc.cloudfunctions.net/verifySignedMessage";

@autoinject
export class FirestoreService {
  public dealsCollectionQuery = query(collection(db, DEALS_COLLECTION));
  public accessToken;

  constructor(private ethereumService: EthereumService) {}

  public async getNonceToSign(address: string): Promise<any> {
    let nonce: string;
    await axios.post(`${CLOUD_FUNCTIONS_URL}/getNonceToSign`, {address}).then(response => {
      nonce = response.data.nonce;
    });

    return nonce;
  }

  public async requestSignature(address: string, nonce: string) {
    const signature = await this.ethereumService.getDefaultSigner().signMessage(nonce);

    console.log("signature", signature);

    return signature;
  }

  public async verifySignedMessage(address: string, signature: string): Promise<string> {
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/verifySignedMessage`, {address, signature});
    console.log(response.data.token);

    return response.data.token;
  }

  public async signInWithCustomToken(token) {
    const auth = getAuth();
    signInWithCustomToken(auth, token)
      .then(async (userCredential) => {
        this.accessToken = await userCredential.user.getIdToken();
        console.log(userCredential, this.accessToken);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

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
