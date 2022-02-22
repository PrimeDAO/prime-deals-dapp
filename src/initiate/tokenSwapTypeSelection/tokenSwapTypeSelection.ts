import { IDealTypeBox } from "initiate/dealTypeSelector/dealTypeSelector";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Open Proposal",
      slug: "initiate/token-swap/open-proposal/proposal",
      isDisabled: false,
      description: "Launch a new proposal open for any DAO to propose a partnership deal based off of the template you create.",
    },
    {
      name: "Partnered Deal",
      slug: "initiate/token-swap/partnered-deal/proposal",
      isDisabled: false,
      description: "Already have a DAO partner or know the DAO you want to propose to? Let them join you to refine, finalize, and seal an agreement on-chain.",
    },
  ];
}
