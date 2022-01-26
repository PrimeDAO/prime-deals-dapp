import { IDAO, IDealConfig } from "registry-wizard/dealConfig";
import { DataSourceDeals } from "./DataSourceDeals";

const MOCK_DATA = {
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id"],
  "open_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
      ]as Partial<IDAO>[],
    },
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  "partner_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
        {name: "Partner"},
      ]as Partial<IDAO>[],
    },
  },
} as const;

type MockDataKeys = keyof typeof MOCK_DATA

export class CeramicServiceMock implements DataSourceDeals {
  constructor() {}

  initialize(rootId?: string): void {
    // throw new Error("Method not implemented.");
  }

  get<T>(id: MockDataKeys): T {
    return MOCK_DATA[id] as unknown as T;
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
