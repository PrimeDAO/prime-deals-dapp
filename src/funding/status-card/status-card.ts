import "./status-card.scss";
import { containerless, bindable } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { ITokenFunding } from "entities/TokenFunding";
import { DealStatus } from "entities/IDealTypes";

@containerless
export class StatusCard {
  @bindable dao: IDAO;
  private dealStatuses = DealStatus; //have to assign this to a view model field for the HTML to be able to compare enums
  get status(): DealStatus{
    if (this.dao.tokens.some((x: ITokenFunding) => Number(x.required) <= 0)){
      return DealStatus.targetReached;
    } else {
      return DealStatus.fundingInProgress;
    }
  }
}
