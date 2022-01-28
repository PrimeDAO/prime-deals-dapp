import { DataSourceDeals } from "./DataSourceDeals";
import { RegistrationData } from "dealWizard/registrationData";
import { IDAO, IDealRegistrationData } from "entities/Deal";

const MOCK_DATA = {
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id"],
  "open_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
      ]as Partial<IDAO>[],
    },
  },
  "open_deals_stream_id_2": {
    registration: new RegistrationData(),
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

export class CeramicServiceMock implements DataSourceDeals {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialize(rootId?: string): void {
    // throw new Error("Method not implemented.");
  }

  get<T>(id: string): T {
    return MOCK_DATA[id] as unknown as T;
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
