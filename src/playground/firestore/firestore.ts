import { autoinject } from "aurelia-framework";
import { onSnapshot } from "firebase/firestore";
import { EventAggregator } from "aurelia-event-aggregator";
import { FirestoreService } from "services/FirestoreService";
import { EthereumService } from "services/EthereumService";
import { getAuth } from "firebase/auth";

@autoinject
export class Firestore {
  title;
  private = false;
  address;
  primaryDaoRepresentativeOne;
  primaryDaoRepresentativeTwo;
  partnerDaoRepresentativeOne;
  partnerDaoRepresentativeTwo;
  myPrivateDeals;
  myPrivateDealsVotes = {};
  allDeals;
  realTimeAllDeals;
  currentWalletAddress?: string;

  constructor(
    private firestoreService: FirestoreService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ){}

  async attached() {
    getAuth().onAuthStateChanged(async (user) => {
      console.log("user", user);
      await this.getRealtimeMyPrivateDeals(user.uid);
    });
    console.log(getAuth().currentUser);
    this.currentWalletAddress = this.ethereumService.defaultAccountAddress;
    this.eventAggregator.subscribe("Network.Changed.Account", async (address) => {
      this.currentWalletAddress = address;
      const nonce = await this.firestoreService.getNonceToSign(address);
      console.log("nonce", nonce);
      const signature = await this.firestoreService.requestSignature(address, nonce);

      const token = await this.firestoreService.verifySignedMessage(address, signature);
      await this.firestoreService.signInWithCustomToken(token);
    });

    this.allDeals = await this.firestoreService.getAllPublicDeals();

    this.getRealtimeAllPublicDeals();
  }

  add() {
    if (!this.validate()) {
      return;
    }

    this.firestoreService.addDeal({
      proposal: {
        title: this.title,
      },
      private: this.private,
      proposalLead: {
        address: this.address,
      },
      primaryDAO: {
        representatives: [{
          address: this.primaryDaoRepresentativeOne,
        }, {
          address: this.primaryDaoRepresentativeTwo,
        }],
      },
      partnerDAO: {
        representatives: [{
          address: this.partnerDaoRepresentativeOne,
        }, {
          address: this.partnerDaoRepresentativeTwo,
        }],
      },
    });
  }

  edit(ref: any, data: any) {
    this.firestoreService.editDeal(ref, data);
  }

  validate() {
    if (
      !this.title ||
      !this.address ||
      !this.primaryDaoRepresentativeOne ||
      !this.primaryDaoRepresentativeTwo ||
      !this.partnerDaoRepresentativeOne ||
      !this.partnerDaoRepresentativeTwo
    ) {
      return false;
    }
    return true;
  }

  getRealtimeAllPublicDeals() {
    onSnapshot(this.firestoreService.dealsCollectionQuery, (collection) => {
      this.realTimeAllDeals = collection.docs.map(doc => ({
        ref: doc.ref,
        data: doc.data(),
      }));
    });
  }

  async getRealtimeMyPrivateDeals(address: string) {
    onSnapshot(this.firestoreService.myDealsCollectionQuery(address), async (collection) => {
      this.myPrivateDeals = collection.docs.map((doc) => {
        return {
          ref: doc.ref,
          data: doc.data(),
        };
      });

      for (const deal of this.myPrivateDeals) {
        const votes = await this.firestoreService.getDealVotes(deal.ref.id);

        console.log(deal, votes);
        this.myPrivateDealsVotes[deal.ref.id] = votes;
      }

      console.log(this.myPrivateDeals);
    });
  }

  async updateVote(dealId: string, address: string, vote: boolean) {
    console.log(dealId, address, vote);
    await this.firestoreService.updateVote(dealId, address, vote);
  }
}
