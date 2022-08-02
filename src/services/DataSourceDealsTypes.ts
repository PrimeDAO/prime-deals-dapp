import { DI } from "aurelia";
import { Observable } from "rxjs";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDealDiscussion } from "entities/DealDiscussions";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { Address, Hash } from "./EthereumService";

export type IDealIdType = string;

export interface IDataSourceDeals {
  initialize(): void;
  /**
   * Create a new Deal
   * @param accountAddress
   * @param registration
   */
  createDeal<TDealDocument extends IDealTokenSwapDocument, TRegistration extends IDealRegistrationTokenSwap>(
    accountAddress: Address,
    registration: TRegistration): Promise<TDealDocument>;

  /**
   * Get the collection of deal documents
   *
   * @param accountAddress if set then can include private deals that
   * they are allowed to see
   */
  getDeals<TDealDocument extends IDealTokenSwapDocument>(accountAddress?: Address): Promise<Array<TDealDocument>>;

  /**
   * Tries to authenticate provided accountAddress to the data source
   */
  syncAuthentication(accountAddress?: string): Promise<boolean>;

  /**
   * Is user authenticated to the data source
   */
  isUserAuthenticatedWithAddress(accountAddress: string): boolean;

  isUserAuthenticated: boolean;

  /**
   * Returns Observable of all deals, and emits when any of them update
   * Doesn't return the actual deal document, only the time when it was modified
   */
  allDealsUpdatesObservable(): Observable<Array<{ dealId: string, modifiedAt: string }>>;
  /**
   * Get deal document by Id
   */
  getDealById<TDealDocument extends IDealTokenSwapDocument>(dealId: string): Promise<TDealDocument>;

  /**
   * add new vote or update existing
   * @param dealId
   * @param accountAddress
   * @param yes
   */
  updateVote(
    dealId: IDealIdType,
    accountAddress: Address,
    dao: "PRIMARY_DAO" | "PARTNER_DAO",
    yes: boolean): Promise<void>;

  deleteAllVotes(
    dealId: IDealIdType,
    accountAddress: Address): Promise<void>;
  /**
   * update deal registration
   * @param dealId
   * @param accountAddress
   * @param registration
   */
  updateRegistration<TRegistration extends IDealRegistrationTokenSwap>(
    dealId: IDealIdType,
    accountAddress: Address,
    registration: Partial<TRegistration>): Promise<void>;
  /**
   * Adds discussion to clauseDiscussions map
   * @param dealId
   * @param accountAddress
   * @param clauseId
   * @param discussionId
   */
  addClauseDiscussion(
    dealId: IDealIdType,
    accountAddress: Address,
    clauseId: string,
    discussion: IDealDiscussion): Promise<void>;

  /**
   * Update isWithdrawn flag
   * @param dealId
   * @param accountAddress
   * @param value
   */
  updateDealIsWithdrawn(
    dealId: IDealIdType,
    accountAddress: Address,
    value: boolean,
  ): Promise<void>;

  /**
   * Update isWithdrawn flag
   */
  updateDealIsPrivate(
    dealId: IDealIdType,
    value: boolean,
  ): Promise<void>;
  /**
   * Update isRejected flag
   * @param dealId
   * @param accountAddress
   * @param value
   */
  updateDealIsRejected(
    dealId: IDealIdType,
    accountAddress: Address,
    value: boolean,
  ): Promise<void>;
  /**
   * Update swapTxHash property
   * @param dealId
   * @param accountAddress
   * @param value
   */
  updateSwapTxHash(
    dealId: IDealIdType,
    accountAddress: Address,
    value: Hash,
  ): Promise<void>;
  /**
   * Should we ask user to sign authentication message
   */
  isUserSignatureRequired(accountAddress?: string): boolean;
}
export const IDataSourceDeals = DI.createInterface<IDataSourceDeals>("DataSourceDeals");
