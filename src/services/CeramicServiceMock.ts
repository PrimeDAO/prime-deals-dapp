import { DealRegistrationData, IDAO } from "entities/DealRegistrationData";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";

const MOCK_DATA = {
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id", "open_deals_stream_id_2"],
  "open_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
      ]as Partial<IDAO>[],
    },
  },
  "open_deals_stream_id_2": {
    registration: {
      ...new DealRegistrationData(),
      proposal: {
        title: "First Proposal",
        summary: "Quick summary",
        description: "Long description lorem ipsum",
      },
      proposalLead: {
        address: "0x123123123",
        email: "",
      },
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

export class CeramicServiceMock extends IDataSourceDeals {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public initialize(rootId?: IKey): void {
    // throw new Error("Method not implemented.");
  }

  public get<T>(id: IKey): T {
    return MOCK_DATA[id] as unknown as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public create(registration: IKey): Promise<string> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(id: IKey, data: string): Promise<IKey> {
    throw new Error("Method not implemented.");
  }
}
