import { Observable } from "rxjs";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDealDiscussion } from "entities/DealDiscussions";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { Address } from "./EthereumService";

export type IDealIdType = string;

/**
 * this is a hack using a class to simulate an interface that we
 * can inject
 */
export abstract class IDataSourceDeals {
  initialize(): void {
    throw new Error("Method not implemented.");
  }
  /**
   * Create a new Deal
   * @param accountAddress
   * @param registration
   */
  createDeal<TDealDocument extends IDealTokenSwapDocument, TRegistration extends IDealRegistrationTokenSwap>(
    accountAddress: Address,
    registration: TRegistration): Promise<TDealDocument> {
    throw new Error("Method not implemented.");
  }

  /**
   * Get the collection of deal documents
   *
   * @param accountAddress if set then can include private deals that
   * they are allowed to see
   */
  getDeals<TDealDocument extends IDealTokenSwapDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
    throw new Error("Method not implemented.");
  }

  /**
   * Tries to authenticate provided accountAddress to the data source
   */
  syncAuthentication(accountAddress?: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  /**
   * Is user authenticated to the data source
   */
  isUserAuthenticatedWithAddress(accountAddress: string): boolean {
    throw new Error("Method not implemented.");
  }

  isUserAuthenticated: boolean;

  /**
   * Returns Observable of all deals, and emits when any of them update
   * Doesn't return the actual deal document, only the time when it was modified
   */
  allDealsUpdatesObservable(): Observable<Array<{dealId: string, modifiedAt: string}>> {
    throw new Error("Method not implemented.");
  }

  /**
   * Get deal document by Id
   */
  getDealById<TDealDocument extends IDealTokenSwapDocument>(dealId: string): Promise<TDealDocument> {
    throw new Error("Method not implemented.");
  }

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
    yes: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteAllVotes(
    dealId: IDealIdType,
    accountAddress: Address): Promise<void> {
    throw new Error("Method not implemented.");
  }
  /**
   * update deal registration
   * @param dealId
   * @param accountAddress
   * @param registration
   */
  updateRegistration<TRegistration extends IDealRegistrationTokenSwap>(
    dealId: IDealIdType,
    accountAddress: Address,
    registration: TRegistration): Promise<void> {
    throw new Error("Method not implemented.");
  }
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
    discussion: IDealDiscussion): Promise<void> {
    throw new Error("Method not implemented.");
  }

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
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   * Update isWithdrawn flag
   */
  updateDealIsPrivate(
    dealId: IDealIdType,
    value: boolean,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

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
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   * Should we ask user to sign authentication message
   */
  isUserSignatureRequired(accountAddress?: string): boolean {
    throw new Error("Method not implemented.");
  }
}
