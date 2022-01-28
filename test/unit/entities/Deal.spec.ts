import { Container } from "aurelia-framework";
import { CeramicServiceMock, MOCK_DATA } from "services/CeramicServiceMock";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { Deal } from "../../../src/entities/Deal";

describe.only("Entities: Deal", () => {
  let deal: Deal;

  beforeAll(() => {
    const container = new Container();
    container.registerSingleton(IDataSourceDeals, CeramicServiceMock);
    deal = container.get(Deal)
  })

  it("Hydrate", async () => {
    const key = "open_deals_stream_id";
    const myDeal = deal.create(key);
    await myDeal.initialize();

    expect(myDeal.rootData).toEqual(MOCK_DATA[key])
  });
});
