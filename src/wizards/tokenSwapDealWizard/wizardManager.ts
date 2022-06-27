import { IDealIdType } from "./../../services/DataSourceDealsTypes";
import { STAGE_ROUTE_PARAMETER } from "./dealWizardTypes";
import "../wizards.scss";
import { IRoute, IRouteableComponent, RoutingInstruction } from "@aurelia/router";

import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../resources/temporary-code";
import { ProposalStage } from "./stages/proposalStage/proposalStage";
import { PartnerDaoStage } from "./stages/partnerDaoStage/partnerDaoStage";

@processContent(autoSlot)
export class WizardManager implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: "",
      title: "Proposal",
      viewport: "stages",
      component: ProposalStage,
    },
    {
      path: "partner-dao",
      title: "Partner DAO",
      viewport: "stages",
      component: PartnerDaoStage,
    },
  ];

  public async canLoad(params: { [STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType }, instruction: RoutingInstruction): Promise<boolean> {
    return Promise.resolve(true);
  }

}
