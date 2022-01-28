import { Hash } from "./EthereumService";
import { IDealRegistrationData } from "entities/Deal";

export declare class IDataSourceDeals {
  initialize(rootId?: Hash): void;

  /** Maybe: if id is not set, then could use rootId */
  get<T>(id?: string): T

  create(registration: IDealRegistrationData): Promise<Hash>

  save(id: Hash, registration: IDealRegistrationData): void

  update(id: Hash, registration: IDealRegistrationData): void
}
