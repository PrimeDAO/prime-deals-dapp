import { IDataSourceDeals } from "./IDataSource";
import { IDealRegistrationData } from "entities/Deal";

export class DataSourceDeals implements IDataSourceDeals {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialize(rootId?: string): void {
    // throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get<T>(id?: string): T {
    return;
    // throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(registration: IDealRegistrationData): Promise<string> {
    return Promise.resolve("");
    // throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(id: string, registration: IDealRegistrationData): void {
    // throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: string, registration: IDealRegistrationData): void {
    // throw new Error("Method not implemented.");
  }
}
