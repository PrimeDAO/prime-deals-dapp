import { Funding } from "./funding/funding";
import { Documentation } from "./documentation/documentation";
import { Initiate } from "./initiate/initiate";
import { IRoute } from "@aurelia/router";
import { STAGE_ROUTE_PARAMETER, WizardType } from "./wizards/tokenSwapDealWizard/dealWizardTypes";
import { Home } from "./home/home";
import { Deals } from "deals/list/deals";
import { DealDashboard } from "./dealDashboard/dealDashboard";

export const routes: IRoute[] = [
  {
    path: "",
    id: "home",
    title: "Home",
    component: Home,
  },
  {
    path: "home",
    id: "home",
    title: "Home",
    component: Home,
  },
  {
    path: "initiate",
    id: "initiate",
    title: "Initiate",
    component: Initiate,
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
    component: Deals,
  },
  {
    path: "documentation",
    id: "documentation",
    title: "Documentation",
    component: Documentation,
  },
  {
    id: "dealDashboard",
    path: "deal/:id",
    component: DealDashboard,
  },
  {
    component: import("./documentation/officialDocs/termsOfService.html"),
    id: "termsOfService",
    path: "terms-of-service",
    title: "Terms of Service",
  },
  {
    component: Funding,
    id: "funding",
    path: "/funding/:id",
    title: "Funding",
  },
  {
    component: import("./playground/playground"),
    id: "playground",
    path: ["playground"],
    title: "Playground",
  },
  {
    path: `/initiate/token-swap/open-proposal/:${STAGE_ROUTE_PARAMETER}`,
    id: "initiate/token-swap/open-proposal",
    title: "Create an Open Proposal",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    parameters: {
      wizardType: WizardType.createOpenProposal,
    },
  },
  {
    path: `/initiate/token-swap/partnered-deal/*${STAGE_ROUTE_PARAMETER}`,
    id: "createPartneredDeal",
    title: "Create a Partnered Deal",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    parameters: {
      wizardType: WizardType.createPartneredDeal,
    },
  },
  {
    path: `/initiate/token-swap/make-an-offer/:id/*${STAGE_ROUTE_PARAMETER}`,
    id: "makeOfferWizard",
    title: "Make an offer",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    parameters: {
      wizardType: WizardType.makeAnOffer,
    },
  },
  {
    path: `/initiate/token-swap/open-proposal/:id/edit/*${STAGE_ROUTE_PARAMETER}`,
    id: "editOpenProposal",
    title: "Edit an Open Proposal",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    parameters: {
      wizardType: WizardType.editOpenProposal,
    },
  },
  {
    path: `/initiate/token-swap/partnered-deal/:id/edit/*${STAGE_ROUTE_PARAMETER}`,
    id: "editPartneredDeal",
    title: "Edit a Partnered Deal",
    component: import("./wizards/tokenSwapDealWizard/wizardManager"),
    parameters: {
      wizardType: WizardType.editPartneredDeal,
    },
  },
];
