import { autoinject } from "aurelia-framework";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { FirestoreService } from "./../../services/FirestoreService";

@autoinject
export class FirebasePlayground {
  allPublicDeals: any;

  constructor(private firestoreService: FirestoreService) {}

  async attached() {
    this.allPublicDeals = await this.firestoreService.getAllPublicDeals();
    console.log(this.allPublicDeals);
  }

  createDeal() {
    this.firestoreService.createTokenSwapDeal({createdAt: new Date().toISOString(), private: false} as any);
  }

  updateDealRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    this.firestoreService.updateTokenSwapRegistrationData(dealId, registrationData);
  }
}
