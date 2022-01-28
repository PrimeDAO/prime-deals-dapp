import { IDealTypeBox } from "initiate/dealTypeSelector/dealTypeSelector";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Open Proposal",
      slug: "initiate/token-swap/open-proposal/stage1",
      isDisabled: false,
      description: "Select this option if you’re looking for a partner and would like to make a deal proposal.",
    },
    {
      name: "Partnered Deal",
      slug: "initiate/token-swap/partnered-deal/stage1",
      isDisabled: false,
      description: "Select this option if you already have a partner DAO and would like to create a token swap deal with them.",
    },
  ];
}
