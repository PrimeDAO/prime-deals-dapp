import { inject } from "aurelia";
import { FirebaseService } from "services/FirebaseService";
import { FirestoreService } from "services/FirestoreService";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address, Hash, IEthereumService } from "services/EthereumService";
import { IFirebaseDocument } from "services/FirestoreTypes";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Observable } from "rxjs";

@inject()
export class FirestoreDealsService<
  TDealDocument extends IDealTokenSwapDocument,
  TRegistrationData extends IDealRegistrationTokenSwap> implements IDataSourceDeals {

  constructor(
    private firestoreService: FirestoreService<TDealDocument, TRegistrationData>,
    private consoleLogService: ConsoleLogService,
    private firebaseService: FirebaseService,
    @IEthereumService private ethereumService: IEthereumService,
  ) {}

  public initialize(): void {
    this.firebaseService.initialize();
  }

  public async syncAuthentication(accountAddress: string): Promise<boolean> {
    return await this.firebaseService.syncFirebaseAuthentication(accountAddress);
  }

  public async getDeals<TDealDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
    let deals: Array<IFirebaseDocument<TDealDocument>>;

    // If the user is authenticated load all deals they can see.
    // Otherwise load all public deals
    if (accountAddress && this.isUserAuthenticatedWithAddress(accountAddress)) {
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
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.createDealTokenSwap(registration as any) as any;
  }

  public updateRegistration<TRegistrationData>(dealId: string, accountAddress: string, registration: TRegistrationData): Promise<void> {
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.updateTokenSwapRegistrationData(dealId, registration as any);
  }

  public updateVote(dealId: string, accountAddress: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", yes: boolean): Promise<void> {
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.updateRepresentativeVote(dealId, accountAddress, dao, yes);
  }

  public deleteAllVotes(_dealId: string, _accountAddress: string): Promise<void> {
    return;
  }

  public addClauseDiscussion(dealId: string, accountAddress: string, clauseId: string, discussion: any): Promise<void> {
    return this.firestoreService.addClauseDiscussion(dealId, clauseId, discussion);
  }

  public updateDealIsWithdrawn(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsWithdrawn(dealId, value);
  }

  public updateDealIsPrivate(dealId: string, value: boolean): Promise<void> {
    return this.firestoreService.updateDealIsPrivate(dealId, value);
  }

  public updateDealIsRejected(dealId: string, accountAddress: string, value: boolean): Promise<void> {
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.updateDealIsRejected(dealId, value);
  }

  public updateSwapTxHash(dealId: string, accountAddress: string, value: Hash): Promise<void> {
    if (!this.isUserAuthenticatedWithAddress(accountAddress)) {
      return;
    }

    return this.firestoreService.updateSwapTxHash(dealId, value);
  }

  public getDealById<TDealDocument>(dealId: string): Promise<TDealDocument> {
    return this.firestoreService.getDealById<TDealDocument>(dealId);
  }

  public allDealsUpdatesObservable(): Observable<{ dealId: string; modifiedAt: string; }[]> {
    return this.firestoreService.allDealsUpdatesObservable();
  }

  /**
   * check if provided accountAddress is currently authenticated to Firebase
   * @param accountAddress string
   * @returns boolean
   */
  public isUserAuthenticatedWithAddress(accountAddress: string): boolean {
    if (!this.firebaseService.currentFirebaseUserAddress || !accountAddress) {
      return false;
    }

    return accountAddress.toLowerCase() === this.firebaseService.currentFirebaseUserAddress.toLowerCase();
  }

  public get isUserAuthenticated(): boolean {
    if (!this.firebaseService.currentFirebaseUserAddress || !this.ethereumService.defaultAccountAddress) {
      return false;
    }

    return this.ethereumService.defaultAccountAddress.toLowerCase() === this.firebaseService.currentFirebaseUserAddress.toLowerCase();
  }

  public isUserSignatureRequired(address?: string): boolean {
    if (!address) {
      return false;
    }

    return !this.firebaseService.hasSignatureForAddress(address);
  }
}
