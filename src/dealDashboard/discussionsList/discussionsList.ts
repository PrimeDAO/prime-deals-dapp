import { EventType } from "./../../services/constants";
import { EthereumService } from "services/EthereumService";
import { autoinject, bindable } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";

import { DiscussionsService } from "./../discussionsService";
import { DealService } from "services/DealService";
import { DateService } from "services/DateService";

import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDealDiscussion } from "entities/DealDiscussions";

import "./discussionsList.scss";

@autoinject
export class DiscussionsList{

  private discussionsArray: Array<IDealDiscussion> = [];
  private discussionsHashes: string[];
  private hasDiscussions: boolean;

  @bindable public deal: DealTokenSwap;
  @bindable public discussionId: string = null;
  @bindable public isAuthorized: boolean;
  public paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  constructor(
    private eventAggregator: EventAggregator,
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
  ) {}

  public async attached(): Promise<void> {
    this.initialize();
    this.eventAggregator.subscribe(EventType.NetworkChangedAccount, (): void => {
      this.initialize();
    });
  }

  private initialize() {
    this.discussionsService.loadDealDiscussions(this.deal.clauseDiscussions);

    this.discussionsArray = Object
      .keys(this.discussionsService.discussions)
      .map(key => (
        {
          id: key,
          ...this.discussionsService.discussions[key],
        }
      ));

    this.discussionsArray.forEach(discussion => {
      this.discussionsService.loadProfile(discussion.createdBy.address)
        .then(profile => {
          if (profile.name) discussion.createdByName = profile.name;
        });
    });

    this.hasDiscussions = !!this.discussionsArray.length;
  }

  private navigateTo(discussionId: string): void {
    this.discussionsService.autoScrollAfter(0);
    this.discussionId = discussionId;
  }
}
