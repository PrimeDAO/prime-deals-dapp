import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "../../../entities/DealRegistrationTokenSwap";
import "./dealRepresentativesVotes.scss";

@autoinject
export class DealRepresentativesVotes {
  @bindable dao: IDAO;

  showMore = false;

  panel: HTMLElement;

  @computedFrom("showMore")
  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }
}
