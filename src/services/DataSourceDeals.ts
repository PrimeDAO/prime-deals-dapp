import { IDealConfig } from "registry-wizard/dealConfig";
import { IDataSourceDeals } from "./IDataSource";

export class DataSourceDeals implements IDataSourceDeals {
  initialize(rootId?: string): void {
    // throw new Error("Method not implemented.");
  }
  get<T>(id?: string): T {
    return;
    // throw new Error("Method not implemented.");
  }
  create(registration: IDealConfig): Promise<string> {
    return Promise.resolve("");
    // throw new Error("Method not implemented.");
  }
  save(id: string, registration: IDealConfig): void {
    // throw new Error("Method not implemented.");
  }
  update(id: string, registration: IDealConfig): void {
    // throw new Error("Method not implemented.");
  }
}
