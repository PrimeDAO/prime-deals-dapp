import "./status-card.scss";
import { containerless, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { ITokenFunding } from "entities/TokenFunding";
import { DealStatus } from "entities/IDealTypes";

@containerless
export class StatusCard {
  @bindable dao: IDAO;
  @bindable tokens: ITokenFunding[];
  @bindable swapCompleted: boolean;
  @bindable fundingFailed: boolean;
  private dealStatuses = DealStatus; //have to assign this to a view model field for the HTML to be able to compare enums

  @computedFrom("swapCompleted", "dao")
  get chipColor(): string{
    if (this.swapCompleted){
      return "success";
    }
    if (this.tokens.every((x: ITokenFunding) => x.required?.lte(0))){
      return "success";
    } else {
      return this.fundingFailed ? "danger" : "warning";
    }
  }

  @computedFrom("swapCompleted", "dao")
  get status(): DealStatus | string{
    if (this.swapCompleted){
      return "Swap completed"; //TODO why is there no status in DealStatus for "Swap Completed"?
    }
    if (this.tokens.every((x: ITokenFunding) => x.required?.lte(0))){
      return "Target reached"; //DealStatus.completed; //TODO why is there no status in DealStatus for "Target Reached"?
    } else {
      return this.fundingFailed ? "Target not reached" : "Funding in progress"; //DealStatus.funding; //TODO why is there no status in DealStatus for "Funding in progress"?
    }
  }
}
