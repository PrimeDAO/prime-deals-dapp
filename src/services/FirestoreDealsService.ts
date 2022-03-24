import { autoinject } from "aurelia-framework";
import { firebaseAuth } from "./FirebaseService";
import { FirestoreService } from "./FirestoreService";
import { IDataSourceDeals2 } from "./DataSourceDealsTypes";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address } from "services/EthereumService";
import { IFirebaseDocument } from "services/FirestoreTypes";

@autoinject
export class FirestoreDealsService<
  TDealDocument extends IDealTokenSwapDocument,
  TRegistrationData extends IDealRegistrationTokenSwap> implements IDataSourceDeals2 {

  constructor(
    private firestoreService: FirestoreService<TDealDocument, TRegistrationData>,
  ) {}

  initialize(): void {
    throw new Error("Method not implemented.");
  }

  public async getDeals<TDealDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
    let deals: Array<IFirebaseDocument<TDealDocument>>;

    if (accountAddress) {
      deals = await this.firestoreService.getAllPublicDeals();
    } else {
      deals = await this.firestoreService.getAllDealsForTheUser(accountAddress);
    }
    return deals.map((deal) => deal.data);
  }

  public createDeal<TDealDocument, TRegistrationData>(accountAddress: string, registration: TRegistrationData): Promise<TDealDocument> {

    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.createDealTokenSwap(registration as any) as any;
  }

  public updateRegistration<TRegistrationData>(dealId: string, accountAddress: string, registration: TRegistrationData): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateTokenSwapRegistrationData(dealId, registration as any);
  }

  public updateVote(dealId: string, accountAddress: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", yes: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateRepresentativeVote(dealId, accountAddress, dao, yes);
  }

  public deleteAllVotes(_dealId: string, _accountAddress: string): Promise<void> {
    return;
  }

  public addClauseDiscussion(dealId: string, accountAddress: string, clauseId: string, discussionId: string): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.addClauseDiscussion(dealId, clauseId, discussionId);
  }

  public updateDealIsWithdrawn(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsWithdrawn(dealId, value);
  }

  public updateDealIsRejected(dealId: string, accountAddress: string, value: boolean): Promise<void> {
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
