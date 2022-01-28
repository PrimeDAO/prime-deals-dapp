import { IDAO, IDealRegistrationData, IProposal, IProposalLead, ITerms } from "entities/Deal";

export class RegistrationData implements IDealRegistrationData {
  public version: string;
  public proposal: IProposal;
  public primaryDAO: IDAO;
  public partnerDAO: IDAO;
  public proposalLead: IProposalLead; // this maps to address
  public terms: ITerms;
  public keepAdminRights: boolean;
  public offersPrivate: boolean;
  public isPrivate: boolean;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;
  public executionPeriodInDays: number;
  public dealType: "token-swap" | "joint-venture"; // do we need this??

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
      address: "",
      email: "",
    };
    this.keepAdminRights = true;
    this.offersPrivate = true;
    this.isPrivate = true;
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }
}
