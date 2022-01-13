import { IProposal, IDAO, ITerms, IAdmin, IClause, IWizardResult } from "../dealWizard.types";

export class OpenDealWizardResult implements IWizardResult {
  public version: string;
  public proposal: IProposal;
  public daos: Array<IDAO>;
  public terms: ITerms;
  public admins: Array<IAdmin>;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "0.0.1";
    this.proposal = {
      name: "",
      overview: "",
    };
    this.daos = [
      {
        name: "",
        tokens: [{
          name: "",
          symbol: "",
          balance: "",
          address: "",
        }],
        social_medias: [{name: undefined, url: undefined}],
        logo_url: null,
      },
      {
        name: "",
        tokens: [{name: undefined, amount: undefined}],
        social_medias: [{name: undefined, url: undefined}],
      },
    ] as IDAO[];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.terms = {
      clauses: [{text: "", tag: ""}] as IClause[],
      period: 14,
      representatives: "",
      previousDiscussionURL: "",
    } as ITerms;
    this.admins = [{address: undefined, represent: undefined}] as IAdmin[];
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }
}
