import { IKey } from "services/DataSourceDealsTypes";

export interface IDeal {
  initialize(): Promise<void>;
  create(id: IKey): IDeal;
  ensureInitialized(): Promise<void>;
  createRegistration(registration: Record<string, any>): Promise<void>;
  updateRegistration(registration: Record<string, any>): Promise<void>;
}
