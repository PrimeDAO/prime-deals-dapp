import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "../../../entities/DealRegistrationTokenSwap";
import "./dealRepresentativesVotes.scss";
import { IVotesInfo } from "../../../entities/IDealTypes";

@autoinject
export class DealRepresentativesVotes {
  @bindable votes: IVotesInfo;
  @bindable dao: IDAO;
  showMore = false;

  panel: HTMLElement;

  @computedFrom("showMore")
  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }

  shouldShowDelimited(count: number, index: number) {
    return this.dao.representatives.length > 2 && !Math.round(index - count / 2);
  }

  @computedFrom("votes")
  private get sortedVotes(): boolean[] {
    return this.dao.representatives.map(x => this.votes[x.address]).sort((a, b) => a > b ? -1 : 1);
  }

}
