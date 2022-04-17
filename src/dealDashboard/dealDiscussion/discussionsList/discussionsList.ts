import { EthereumService } from "services/EthereumService";
import { autoinject, bindingMode, computedFrom } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";

import { DiscussionsService } from "../../discussionsService";
import { DealService } from "services/DealService";
import { DateService } from "services/DateService";

import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDealDiscussion } from "entities/DealDiscussions";

import "./discussionsList.scss";
import { bindable } from "aurelia-typed-observable-plugin";
import { IClause } from "entities/DealRegistrationTokenSwap";

interface IDiscussionListItem extends IDealDiscussion {
  lastModified: string
}

@autoinject
export class DiscussionsList{
  @bindable deal: DealTokenSwap;
  @bindable({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;
  @bindable.booleanAttr authorized: boolean;

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussionsArray: Array<IDiscussionListItem> = [];
  private discussionsHashes: string[];
  private hasDiscussions: boolean;
  private times: any = {
    intervals: Array(typeof setInterval),
  };

  @computedFrom("deal.registrationData.terms.clauses.length")
  private get clauses(): Map<string, IClause> {
    return new Map<string, IClause>(this.deal.registrationData.terms.clauses.map(clause => [clause.id, clause]));
  }

  @computedFrom("deal.clauseDiscussions", "deal.registrationData.terms.clauses")
  private get discussions(): Map<string, IDealDiscussion> {
    const discussionsMap = new Map();

    Object.entries(this.deal.clauseDiscussions).forEach(async ([id, discussion]) => {
      if (!discussion) return;

      if (!discussion?.createdBy?.name) {
        this.discussionsService.loadProfile(discussion.createdBy.address)
          .then(profile => {
            if (profile.name) discussion.createdBy.name = profile.name;
          });
      }
      discussionsMap.set(id, discussion);
    });

    return discussionsMap;
  }

  private findClauseIndex(discussionId: string): string {
    const discussionsIds = this.deal?.registrationData?.terms?.clauses.map(clause => clause.id);
    const notFoundText = "-";

    if (discussionsIds.indexOf(discussionId) > -1) {
      return (discussionsIds.indexOf(discussionId) + 1).toString() || notFoundText;
    }

    return notFoundText;
  }

  constructor(
    private eventAggregator: EventAggregator,
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.initialize();
    });
  }

  private initialize() {
    this.discussionsService.loadDealDiscussions(this.deal.clauseDiscussions);

    this.hasDiscussions = !!this.discussions.size;
  }

  detached() {
    this.times.intervals.forEach((interval: ReturnType<typeof setTimeout>) => clearInterval(interval));
  }

  private navigateTo(discussionId: string): void {
    this.discussionsService.autoScrollAfter(0);
    this.discussionId = discussionId;
  }
}
