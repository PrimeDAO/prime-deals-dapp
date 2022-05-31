import { IRoute } from "@aurelia/router";

export const routes: IRoute[] = [
  {
    path: ["", "home"],
    id:  "home",
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
];
