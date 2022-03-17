import { EthereumService } from "./../../services/EthereumService";
import { autoinject } from "aurelia-framework";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Subscription } from "rxjs";
import { FirestoreService } from "./../../services/FirestoreService";
import { openProposalDummyData1, partnerDealDummyData1 } from "./firebaseDummyData";

@autoinject
export class FirebasePlayground {
  allDeals: any = [];
  subscriptions: Array<Subscription> = [];

  constructor(
    private firestoreService: FirestoreService,
    private ethereumService: EthereumService,
  ) {}

  async attached() {
    this.subscriptions.push(
      this.firestoreService.subscribeToAllDealsForUser()
        .subscribe(
          deals => {
            this.allDeals = deals;
            console.log("All deals for user", deals);
          },
          error => {
            console.log("error", error);
          },
        ),
    );
  }

  detached() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  vote(dealId: string, address: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", value: any) {
    this.firestoreService.updateRepresentativeVote(dealId, address, dao, value);
  }

  createOpenProposal() {
    this.firestoreService.createTokenSwapDeal(openProposalDummyData1);
  }

  createPartneredDeal() {
    this.firestoreService.createTokenSwapDeal(partnerDealDummyData1);
  }

  updateDealRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    this.firestoreService.updateTokenSwapRegistrationData(dealId, registrationData);
  }

  async getDealById(dealId: string) {
    try {
      const deal = await this.firestoreService.getDealById(dealId);
      console.log(deal);
    } catch (error){
      console.error(error);
    }
  }

  async getAllPublicDeals() {
    try {
      const deals = await this.firestoreService.getAllPublicDeals();
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getRepresentativeDeals() {
    try {
      const deals = await this.firestoreService.getRepresentativeDeals(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getProposalLeadDeals() {
    try {
      const deals = await this.firestoreService.getProposalLeadDeals(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getAllDealsForTheUser() {
    try {
      const deals = await this.firestoreService.getAllDealsForTheUser(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }
}
