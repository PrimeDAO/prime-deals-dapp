import { IDealTypeBox } from "initiate/dealTypeSelector/dealTypeSelector";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Open Proposal",
      slug: "initiate/token-swap/open-proposal/proposal",
      isDisabled: false,
      description: "Don't have a partner DAO yet? Launch a new proposal and find the perfect partner DAO out there.",
    },
    {
      name: "Partnered Deal",
      slug: "initiate/token-swap/partnered-deal/proposal",
      isDisabled: false,
      description: "Already have a DAO partner? Let them join you to refine, finalize and seal your agreement on chain.",
    },
  ];
}
