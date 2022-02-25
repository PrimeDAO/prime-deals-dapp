import { autoinject } from "aurelia-framework";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { collection, addDoc, getDocs, getFirestore, query, updateDoc, setDoc, doc, writeBatch, where } from "firebase/firestore";
import axios from "axios";
import { EthereumService } from "services/EthereumService";
import { v4 as uuidv4 } from "uuid";

const db = getFirestore();
const DEALS_COLLECTION = "deals";
const VOTES_COLLECTION = "votes";
const CLOUD_FUNCTIONS_URL = "https://us-central1-deals-poc.cloudfunctions.net";
// const CLOUD_FUNCTIONS_URL = "http://localhost:5001/deals-poc/us-central1";
// const getNonceToSign = "https://us-central1-deals-poc.cloudfunctions.net/getNonceToSign";
// const verifySignedMessage = "https://us-central1-deals-poc.cloudfunctions.net/verifySignedMessage";

export interface IFirestoreDeal {
  proposal: {
    title: string;
  };
  private: boolean;
  proposalLead: {
    address: string;
  };
  primaryDAO: {
    representatives: {
      address: string;
    }[]
  };
  partnerDAO: {
    representatives: {
      address: string;
    }[]
  };
}

@autoinject
export class FirestoreService {
  public dealsCollectionQuery = query(collection(db, DEALS_COLLECTION), where("private", "==", false));
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

  public async signInWithCustomToken(token: string) {
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

  public async addDeal(deal: IFirestoreDeal) {
    try {
      // const docRef = await addDoc(collection(db, DEALS_COLLECTION), deal);
      // setDoc(doc(db, DEALS_COLLECTION, "votes", "asd"), deal);

      const batch = writeBatch(db);

      const dealId = uuidv4();
      const dealRef = doc(db, DEALS_COLLECTION, dealId);
      batch.set(dealRef, deal);

      const allRepresentatives = [...deal.primaryDAO.representatives, ...deal.partnerDAO.representatives];

      allRepresentatives.forEach(representative => {
        const representativeRef = doc(db, DEALS_COLLECTION, dealId, VOTES_COLLECTION, representative.address);
        batch.set(representativeRef, {vote: false});
      });

      await batch.commit();

      console.log("Document written with ID: ", dealRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  public async editDeal(ref: any, obj: IFirestoreDeal) {
    await updateDoc(ref, obj);
  }

  public async getAllPublicDeals() {
    const q = query(collection(db, DEALS_COLLECTION), where("private", "==", false));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data());
  }

  public async verifyProposalLead(proposalLeadAddress: string): Promise<boolean> {
    const auth = getAuth();

    if (!auth.currentUser) {
      await this.firebaseLogin(proposalLeadAddress);
    }

    // @TODO should handle the case when user is signed into firebase, but they changed their wallet address in metamask
    if (getAuth().currentUser.uid === proposalLeadAddress) {
      return true;
    }

    return false;
  }

  public async firebaseLogin(address: string) {
    const nonce = await this.getNonceToSign(address);
    const signature = await this.requestSignature(address, nonce);

    const token = await this.verifySignedMessage(address, signature);
    await this.signInWithCustomToken(token);
  }

  public myDealsCollectionQuery(address: string) {
    return query(collection(db, DEALS_COLLECTION), where("proposalLead.address", "==", address));
  }

  public async getDealVotes(dealId: string) {
    const q = query(collection(db, DEALS_COLLECTION, dealId, VOTES_COLLECTION));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      address: doc.id,
      ...doc.data(),
    }));
  }

  public async updateVote(dealId: string, address: string, vote: boolean) {
    const voteRef = doc(db, DEALS_COLLECTION, dealId, VOTES_COLLECTION, address);

    await updateDoc(voteRef, {vote});
  }
}
