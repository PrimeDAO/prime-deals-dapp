import { IRoute } from "@aurelia/router";
import { STAGE_ROUTE_PARAMETER, WizardType } from "./wizards/tokenSwapDealWizard/dealWizardTypes";

export const routes: IRoute[] = [
  {
    path: "",
    id: "home",
    title: "Home",
    component: import("./home/home"),
  },
  {
    path: "home",
    id: "home",
    title: "Home",
    component: import("./home/home"),
  },
  {
    path: "initiate",
    id: "initiate",
    title: "Initiate",
    component: import("./initiate/initiate"),
  },
  {
    path: "initiate/token-swap",
    id: "tokenSwapTypeSelection",
    title: "Select Token Swap Type",
    component: import("./initiate/tokenSwapTypeSelection/tokenSwapTypeSelection"),
  },
  {
    path: "deals",
    id: "deals",
    title: "Deals",
    component: import("./deals/list/deals"),
  },
  {
    path: "documentation",
    id: "documentation",
    title: "Documentation",
    component: import("./documentation/documentation"),
  },
  {
    component: import("./dealDashboard/dealDashboard"),
    id: "dealDashboard",
    path: "deal/:id",
    title: "DEAL Dashboard",
  },
  {
    component: import("./contribute/contribute"),
    id: "contribute",
    path: "contribute",
    title: "Contribute",
  },
  {
    component: import("./documentation/officialDocs/termsOfService.html"),
    id: "termsOfService",
    path: ["terms-of-service"],
    title: "Terms of Service",
  },
  {
    component: import("./funding/funding"),
    id: "funding",
    path: "/funding/:id",
    title: "Funding",
  },
  {
    component: import("./comingSoon/comingSoon"),
    id: "comingSoon",
    path: ["comingSoon"],
    title: "Coming Soon!",
  },
  {
    component: import("./playground/playground"),
    id: "playground",
    path: ["playground"],
    title: "Playground",
  },
  {
    path: `/initiate/token-swap/open-proposal/*${STAGE_ROUTE_PARAMETER}`,
    id: "openProposal",
    title: "Open Proposal",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    data: {
      wizardType: String(WizardType.createOpenProposal),
    },
  },
];
