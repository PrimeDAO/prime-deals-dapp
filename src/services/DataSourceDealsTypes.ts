/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDeal } from "entities/IDealTypes";
import { Address, Hash } from "./EthereumService";

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
    yes: boolean): Promise<void> {
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
    clauseId: number,
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

// export type IDealIdType = string;

// /**
//  * this is a hack using a class to simulate an interface that we
//  * can inject
//  */
// export abstract class IDataSourceDeals {
//   initialize(): void {
//     throw new Error("Method not implemented.");
//   }
//   /**
//    * Get the collection of deal documents
//    *
//    * @param accountAddress if set then can include private deals that
//    * they are allowed to see
//    */
//   getDeals<TDealDocument>(accountAddress?: Address): Promise<Array<TDealDocument>> {
//     throw new Error("Method not implemented.");
//   }
//   /**
//    * add new vote or update existing
//    * @param dealId
//    * @param accountAddress
//    * @param yes
//    */
//   updateVote(
//     dealId: IDealIdType,
//     accountAddress: Address,
//     yes: boolean): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   /**
//    * update deal registration
//    * @param dealId
//    * @param accountAddress
//    * @param registration
//    */
//   updateRegistration<TRegistration>(
//     dealId: IDealIdType,
//     accountAddress: Address,
//     registration: TRegistration): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   /**
//    * Relate clause to a discussion
//    * @param dealId
//    * @param accountAddress
//    * @param clauseId
//    * @param discussionId
//    */
//   addClauseDiscussion<TRegistration>(
//     dealId: IDealIdType,
//     accountAddress: Address,
//     clauseId: number,
//     discussionId: Hash): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   /**
//    * Create a new Deal
//    * @param accountAddress
//    * @param registration
//    */
//   createDeal<TDealDocument, TRegistration>(
//     accountAddress: Address,
//     registration: TRegistration): Promise<TDealDocument> {
//     throw new Error("Method not implemented.");
//   }
// }
