import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { IDAO, IRepresentative } from "../../../entities/DealRegistrationTokenSwap";
import "./dealRepresentativesVotes.scss";
import { DealTokenSwap } from "../../../entities/DealTokenSwap";
import { IVotesInfo } from "../../../entities/IDealTypes";

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

  getVoteSlug(allVotes: IVotesInfo, representativeAddress: string) {
    return allVotes[representativeAddress] === true
      ? "accepted"
      : allVotes[representativeAddress] === false
        ? "declined"
        : "";
  }

  shouldShowDelimited(count: number, index: number) {
    return this.dao.representatives.length > 2 && !Math.round(index - count / 2);
  }

  representativesSortedByVotes(representatives: IRepresentative[], allVotes: IVotesInfo) {
    return this.dao.representatives.sort((a, b) => {
      return allVotes[a.address] > allVotes[b.address] ? -1 : 1;
    });
  }
}
