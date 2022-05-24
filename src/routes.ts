import { Routeable } from "aurelia";

export const routes: Routeable[] = [
  {
    path: ['', 'home'],
    title: "Home",
    id:  'home',
    component: import('./home/home')
  },
  {
    path: 'initiate',
    id: 'initiate',
    title: "Initiate",
    component: import('./initiate/initiate')
  },
  {
    path: 'initiate/token-swap',
    id: 'tokenSwapTypeSelection',
    title: "Select Token Swap Type",
    component: import('./initiate/tokenSwapTypeSelection/tokenSwapTypeSelection')
  },
  {
    path: 'deals',
    id: 'deals',
    title: "Deals",
    component: import('./deals/list/deals')
  },
]
