import { autoinject } from "aurelia-framework";
import { firebaseAuth } from "./FirebaseService";
import { FirestoreService } from "./FirestoreService";
import { IDataSourceDeals } from "./DataSourceDealsTypes";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address } from "services/EthereumService";
import { IFirebaseDocument } from "services/FirestoreTypes";
import { ConsoleLogService } from "services/ConsoleLogService";

@autoinject
export class FirestoreDealsService<
  TDealDocument extends IDealTokenSwapDocument,
  TRegistrationData extends IDealRegistrationTokenSwap> implements IDataSourceDeals {

  constructor(
    private firestoreService: FirestoreService<TDealDocument, TRegistrationData>,
    private consoleLogService: ConsoleLogService,
  ) {}

  public initialize(): void {
    throw new Error("Method not implemented.");
  }

  public async getDeals<TDealDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
    let deals: Array<IFirebaseDocument<TDealDocument>>;

    await this.firestoreService.ensureAuthenticationIsSynced();

    if (accountAddress) {
      if (!this.isUserAuthenticated(accountAddress)) {
        return;
      }
      this.consoleLogService.logMessage(`getting all deals for user ${accountAddress}`);
      try {
        deals = await this.firestoreService.getAllDealsForTheUser(accountAddress);
      } catch (error) {
        throw new Error("Trying to load deals for a user that is not connected");
      }
    } else {
      this.consoleLogService.logMessage("getting all public deals");
      deals = await this.firestoreService.getAllPublicDeals();
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

  public addClauseDiscussion(dealId: string, accountAddress: string, clauseId: string, discussion: any): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.addClauseDiscussion(dealId, clauseId, discussion);
  }

  public updateDealIsWithdrawn(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticated(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsWithdrawn(dealId, value);
  }

  public updateDealIsPrivate(dealId: string, value: boolean): Promise<void> {
    return this.firestoreService.updateDealIsPrivate(dealId, value);
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
    if (!firebaseAuth.currentUser) {
      return;
    }

    return accountAddress.toLowerCase() === firebaseAuth.currentUser.uid.toLowerCase();
  }
}
