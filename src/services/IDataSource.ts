import { IDealConfig } from "registry-wizard/dealConfig";
import { Hash } from "./EthereumService";

export declare class IDataSourceDeals {
  initialize(rootId?: Hash): void;

  /** Maybe: if id is not set, then could use rootId */
  get<T>(id?: string): T

  create(registration: IDealConfig): Promise<Hash>

  save(id: Hash, registration: IDealConfig): void

  update(id: Hash, registration: IDealConfig): void
}
