import { IDealTypeBox } from "./dealTypeSelector/dealTypeSelector";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Token Swap",
      slug: "initiate/token-swap",
      isDisabled: false,
      description: "Trustlessly exchange tokens between multiple parties with customized vesting options.",
    },
    {
      name: "Joint Venture",
      slug: "joint-venture",
      isDisabled: true,
      description: "DAO's collaborate to launch new domain-specific DAO's or entities. ",
    },
  ];
}
