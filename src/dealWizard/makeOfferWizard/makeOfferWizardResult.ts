import { IWizardResult } from "services/WizardService";
import { IProposal, IDAO, IProposalLead } from "../dealWizard.types";

export class MakeOfferWizardResult implements IWizardResult {
  public version: string;
  public proposal: IProposal;
  public primaryDAO: IDAO;
  public partnerDAO: IDAO;
  public proposalLead: IProposalLead;
  public isPrivate: boolean;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "0.0.1";
    this.proposal = {
      title: "First Proposal",
      summary: "Lorem ipsum summary",
      description: "Lorem ipsum description dolor sit amet",
    };
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.primaryDAO = {
      name: "Primary DAO",
      tokens: [{
        name: "",
        symbol: "",
        balance: "",
        address: "",
      }],
      social_medias: [{name: undefined, url: undefined}],
      logo_url: null,
    } as IDAO;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.partnerDAO = {
      name: "",
      tokens: [{
        name: "",
        symbol: "",
        balance: "",
        address: "",
      }],
      social_medias: [{name: undefined, url: undefined}],
      logo_url: null,
    } as IDAO;
    this.proposalLead = {
      address: "0x123123123",
      email: "",
    };
    this.isPrivate = true;
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }
}
