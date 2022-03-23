import { autoinject } from "aurelia-framework";
import { firebaseAuth } from "./FirebaseService";
import { FirestoreService } from "./FirestoreService";
import { IDataSourceDeals2 } from "./DataSourceDealsTypes";

@autoinject
export class FirestoreDealsService implements IDataSourceDeals2 {
  constructor(private firestoreService: FirestoreService) {}

  initialize(): void {
    throw new Error("Method not implemented.");
  }

  getDeals<TDealDocument>(accountAddress?: string): Promise<TDealDocument[]> {
    if (accountAddress) {
      return this.firestoreService.getAllPublicDeals() as any;
    } else {
      this.firestoreService.getAllDealsForTheUser(accountAddress);
    }
  }

  createDeal<TDealDocument, TRegistration>(accountAddress: string, registration: TRegistration): Promise<TDealDocument> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.createDealTokenSwap(registration as any) as any;
  }

  updateRegistration<TRegistration>(dealId: string, accountAddress: string, registration: TRegistration): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateTokenSwapRegistrationData(dealId, registration as any);
  }

  updateVote(dealId: string, accountAddress: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", yes: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateRepresentativeVote(dealId, accountAddress, dao, yes);
  }

  deleteAllVotes(dealId: string, accountAddress: string): Promise<void> {
    return;
  }

  addClauseDiscussion<TRegistration>(dealId: string, accountAddress: string, clauseId: string, discussionId: string): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.addClauseDiscussion(dealId, clauseId, discussionId);
  }

  updateDealIsWithdrawn(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsWithdrawn(dealId, value);
  }

  updateDealIsRejected(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsRejected(dealId, value);
  }

  /**
   * check if provided accountAddress is currently authenticated user
   * @param accountAddress string
   * @returns boolean
   */
  private isUserAuthenticated(accountAddress: string) {
    return accountAddress.toLowerCase() === firebaseAuth.currentUser.uid.toLowerCase();
  }
}
