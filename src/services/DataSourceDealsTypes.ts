/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address, Hash } from "./EthereumService";

export type IKey = Hash;

/**
 * this is a hack using a class to simulate an interface that we
 * can inject
 */
export abstract class IDataSourceDeals {
/**
   * If id is not set, then will use rootId
   * @param id
   */
  initialize(rootId?: IKey): void {
    throw new Error("Method not implemented.");
  }
  get<T>(id?: IKey): T {
    throw new Error("Method not implemented.");
  }
  /**
   * returns the new CID
   */
  create(idParent: IKey, data: string): Promise<IKey> {
    throw new Error("Method not implemented.");
  }
  update(id: IKey, data: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export type IDealIdType = string;

/**
 * this is a hack using a class to simulate an interface that we
 * can inject
 */
export abstract class IDataSourceDeals2 {
  initialize(): void {
    throw new Error("Method not implemented.");
  }
  /**
   * Get the collection of deal documents
   *
   * @param accountAddress if set then can include private deals that
   * they are allowed to see
   */
  getDeals<TDealDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
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
  updateRegistration<TRegistration>(
    dealId: IDealIdType,
    accountAddress: Address,
    registration: TRegistration): Promise<void> {
    throw new Error("Method not implemented.");
  }
  /**
   * Relate clause to a discussion
   * @param dealId
   * @param accountAddress
   * @param clauseId
   * @param discussionId
   */
  addClauseDiscussion<TRegistration>(
    dealId: IDealIdType,
    accountAddress: Address,
    clauseId: string,
    discussionId: Hash): Promise<void> {
    throw new Error("Method not implemented.");
  }
  /**
   * Create a new Deal
   * @param accountAddress
   * @param registration
   */
  createDeal<TDealDocument, TRegistration>(
    accountAddress: Address,
    registration: TRegistration): Promise<TDealDocument> {
    throw new Error("Method not implemented.");
  }
}
