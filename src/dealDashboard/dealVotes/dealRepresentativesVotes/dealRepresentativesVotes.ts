import { IDAO } from "../../../entities/DealRegistrationTokenSwap";
import { IVotesInfo } from "../../../entities/IDealTypes";
import { bindable } from "aurelia";

export class DealRepresentativesVotes {
  @bindable votes: IVotesInfo;
  @bindable dao: IDAO;
  showMore = false;

  panel: HTMLElement;

  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }

  shouldShowDelimited(count: number, index: number) {
    return this.dao.representatives.length > 2 && !Math.round(index - count / 2);
  }

  private get sortedVotes(): boolean[] {
    return this.dao.representatives.map(x => this.votes[x.address]).sort((a, b) => a > b ? -1 : 1);
  }

}
