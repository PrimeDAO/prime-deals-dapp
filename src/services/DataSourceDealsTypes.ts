/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hash } from "./EthereumService";

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
  initialize(rootId?: string): void {
    throw new Error("Method not implemented.");
  }
  get<T>(id?: string): T {
    throw new Error("Method not implemented.");
  }
  create(idParent: string, data: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  update(id: string, data: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
