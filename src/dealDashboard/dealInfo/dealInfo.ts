import { NumberService } from "services/NumberService";
import { EthereumService } from "services/EthereumService";
import { autoinject, bindable } from "aurelia-framework";
import { IDAO, IToken } from "entities/DealRegistrationTokenSwap";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { fromWei } from "services/EthereumService";
import "./dealInfo.scss";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  private primaryDAO: IDAO;
  private partnerDAO: IDAO;
  private dealType: string;
  private representatives: number;
  private tokens: Array<IToken> = [];

  constructor(
    private numberService: NumberService,
    private ethereumService: EthereumService,
  ) {
  }

  attached() {
    this.primaryDAO = this.deal.registrationData.primaryDAO;
    this.partnerDAO = this.deal.registrationData.partnerDAO;
    this.dealType = this.capitalizeWords(this.deal.registrationData.dealType.replace("-", " "));
    this.representatives = [...new Set([
      ...this.primaryDAO.representatives,
      ...this.partnerDAO.representatives,
      this.deal.registrationData.proposalLead,
    ])].length;
    this.tokens = [
      this.deal.registrationData.primaryDAO.tokens[0],
      this.deal.registrationData.partnerDAO.tokens[0],
    ];
  }

  private get isProposalLead(): boolean {
    return this.deal.registrationData.proposalLead.address === this.ethereumService.defaultAccountAddress;
  }

  private capitalizeWords(string) {
    return string.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase() );
  }
}
