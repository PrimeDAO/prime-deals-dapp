import { autoinject } from "aurelia-framework";
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

  dealId: string;

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussionsArray: Array<IDealDiscussion> = [];
  private discussionsHashes: string[];
  private hasDiscussions: boolean;
  private deal: DealTokenSwap;

  constructor(
    private eventAggregator: EventAggregator,
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private discussionsService: DiscussionsService,
  ) {}

  async attached(): Promise<void> {
    this.dealId = this.router.currentInstruction.parentInstruction.params.address;

    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();

    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
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

  private navigateTo(page) {
    this.discussionsService.autoScrollAfter(100);
    this.router.navigate(page);
  }
}
