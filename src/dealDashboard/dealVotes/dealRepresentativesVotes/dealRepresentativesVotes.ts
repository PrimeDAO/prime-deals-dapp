import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "../../../entities/DealRegistrationTokenSwap";
import "./dealRepresentativesVotes.scss";
import { DealTokenSwap } from "../../../entities/DealTokenSwap";

@autoinject
export class DealRepresentativesVotes {
  @bindable deal: DealTokenSwap;
  @bindable dao: IDAO;

  showMore = false;

  panel: HTMLElement;

  @computedFrom("showMore")
  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }

  getVoteSlug(representativeAddress: string) {
    return this.deal.representativeVote(representativeAddress) === true
      ? "accepted"
      : this.deal.representativeVote(representativeAddress) === false
        ? "declined"
        : "";
  }

  shouldShowDelimited(count: number, index: number) {
    return this.dao.representatives.length > 2 && !Math.round(index - count / 2);
  }

  representativesSortedByVotes() {
    return this.dao.representatives.sort((a, b) => {
      return this.deal.representativeVote(a.address) > this.deal.representativeVote(b.address) ? -1 : 1;
    });
  }
}
