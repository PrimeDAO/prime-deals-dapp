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
      name: "Joint Venture",
      slug: "joint-venture",
      isDisabled: true,
      description: "Seed or join into a liquidity pool together with multiple parties.",
    },
  ];
}
