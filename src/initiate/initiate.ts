import { IDealTypeBox } from "./dealTypeSelector/dealTypeSelector";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Token Swap",
      slug: "initiate/token-swap",
      isDisabled: false,
      description: "Safely exchange tokens between multiple parties with customized vesting schedules.",
    },
    {
      name: "Joint venture",
      slug: "joint-venture", // renamed from co-liquidity
      isDisabled: true,
      description: "Create a Joint Venture between two or multiple DAOs with initial distribution and agreements.",
    },
  ];
}
