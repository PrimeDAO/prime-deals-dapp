import { autoinject } from "aurelia-framework";
import { onSnapshot } from "firebase/firestore";
import { EventAggregator } from "aurelia-event-aggregator";
import { FirestoreService } from "services/FirestoreService";
import { EthereumService } from "services/EthereumService";

@autoinject
export class Firestore {
  title;
  address;
  primaryDaoRepresentativeOne;
  primaryDaoRepresentativeTwo;
  partnerDaoRepresentativeOne;
  partnerDaoRepresentativeTwo;
  allOpenDeals;
  realTimeAllOpenDeals;
  currentWalletAddress?: string;

  constructor(
    private firestoreService: FirestoreService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ){}

  async attached() {
    this.currentWalletAddress = this.ethereumService.defaultAccountAddress;
    this.eventAggregator.subscribe("Network.Changed.Account", async (address) => {
      this.currentWalletAddress = address;
      const nonce = await this.firestoreService.getNonceToSign(address);
      console.log("nonce", nonce);
      const signature = await this.firestoreService.requestSignature(address, nonce);

      const token = await this.firestoreService.verifySignedMessage(address, signature);
      await this.firestoreService.signInWithCustomToken(token);
    });

    this.allOpenDeals = await this.firestoreService.getAllPublicDeals();

    onSnapshot(this.firestoreService.dealsCollectionQuery, (collection) => {
      this.realTimeAllOpenDeals = collection.docs.map(doc => ({
        ref: doc.ref,
        data: doc.data(),
      }));
    });
  }

  add() {
    if (!this.validate()) {
      return;
    }

    this.firestoreService.addItem({
      proposal: {
        title: this.title,
      },
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
    this.firestoreService.editItem(ref, data);
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
}
