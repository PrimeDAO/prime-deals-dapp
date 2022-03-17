import { NumberService } from "services/NumberService";
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
  private funds: Array<number> = [];

  constructor(
    private numberService: NumberService,
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
    this.funds = [
      this.numberService.fromString(fromWei(this.tokens[0].amount, this.tokens[0].decimals)),
      this.numberService.fromString(fromWei(this.tokens[1].amount, this.tokens[1].decimals)),
    ];
  }

  private capitalizeWords(string) {
    return string.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase() );
  }
}
