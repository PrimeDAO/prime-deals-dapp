import { autoinject } from "aurelia-framework";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Subscription } from "rxjs";
import { FirestoreService } from "./../../services/FirestoreService";

@autoinject
export class FirebasePlayground {
  allDeals: any = [];
  subscriptions: Array<Subscription> = [];

  constructor(private firestoreService: FirestoreService) {}

  async attached() {
    this.firestoreService.subscribeToAllDealsForUser()
      .subscribe(
        deals => {
          this.allDeals = deals;
          console.log("All deals for user", deals);
        },
        error => {
          console.log("error", error);
        },
      );
  }

  detached() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  vote(dealId: string, address: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", value: any) {
    this.firestoreService.updateRepresentativeVote(dealId, address, dao, value);
  }

  createDeal() {
    this.firestoreService.createTokenSwapDeal({
      createdAt: new Date().toISOString(),
      private: false,
      proposalLead: {
        address: "0xe835f975d731Aa8515DD3Da9ec8a82e1DEF33c34",
      },
      primaryDAO: {
        representatives: [{
          address: "asd",
        }],
      },
      partnerDAO: {
        representatives: [{
          address: "xyz",
        }],
      },
    } as any);
  }

  updateDealRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    this.firestoreService.updateTokenSwapRegistrationData(dealId, registrationData);
  }

  async getDealById(dealId: string) {
    try {
      const deal = await this.firestoreService.getDealById(dealId);
      console.log(deal);
    } catch (error){
      console.log(error);
    }
  }
}
