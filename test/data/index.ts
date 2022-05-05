import * as json1 from "./floresta-open-proposal.json";
import * as json2 from "./floresta-x-climati-partnede-deal.json";
import * as json3 from "./minimal-open-proposal.json";
import * as json4 from "./minimal-partnered-deal.json";
import * as json5 from "./private-partnered-deal.json";
import * as fundingDeals from "./dealFixturesFunding.json";

export const jsonDocs = [json1, json2, json3, json4, json5, ...Array.from(fundingDeals)];
export default jsonDocs;
