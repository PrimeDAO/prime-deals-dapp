import { IWizardResult } from "services/WizardService";
import { IProposal, IDAO, IProposalLead } from "../dealWizard.types";

export class OpenProposalWizardResult implements IWizardResult {
  public version: string;
  public proposal: IProposal;
  public primaryDAO: IDAO;
  public proposalLead: IProposalLead;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;
  public keepAdminRights: boolean;
  public offersPrivate: boolean;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "0.0.1";
    this.proposal = {
      title: "",
      summary: "",
      description: "",
    };
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.primaryDAO = {
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
      address: "",
      email: "",
    };
    this.keepAdminRights = true;
    this.offersPrivate = true;
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }
}
