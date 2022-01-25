import { IDealConfig } from "registry-wizard/dealConfig";
import { IDataSourceDeals } from "./IDataSource";

const MOCK_DATA = {
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id"],
  "open_deals_stream_id": {},
  "partner_deals_stream_id": {},
} as const;

type MockDataKeys = keyof typeof MOCK_DATA

export class CeramicServiceMock implements IDataSourceDeals {
  constructor() {}

  initialize(rootId?: string): void {
    // throw new Error("Method not implemented.");
  }

  get<T>(id: MockDataKeys): T {
    return MOCK_DATA[id] as T;
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
