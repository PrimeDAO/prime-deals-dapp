import { Routeable } from "aurelia";

export const routes: Routeable[] = [
  {
    path: ['', 'home'],
    title: "Home",
    id:  'home',
    component: import('./home/home')
  },
  {
    path: 'contribute',
    id:  'contribute',
    title: "Contribute",
    component: import('./contribute/contribute')
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
]
