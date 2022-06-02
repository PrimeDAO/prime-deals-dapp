import { IEthereumService } from "./../../../services/EthereumService";

import { DiscussionsService } from "../../discussionsService";
import { DealService } from "services/DealService";
import { DateService } from "services/DateService";

import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDealDiscussion } from "entities/DealDiscussions";

import { IClause } from "entities/DealRegistrationTokenSwap";
import { bindable, BindingMode, IEventAggregator, ISignaler } from "aurelia";
import {IRouter} from "@aurelia/router";
import { toBoolean } from "resources/binding-behaviours";

interface IDiscussionListItem extends IDealDiscussion {
  lastModified: string
}

export class DiscussionsList{
  @bindable clauses: Map<string, IClause>;
  @bindable deal: DealTokenSwap;
  @bindable({mode: BindingMode.twoWay}) discussionId?: string;
  @bindable({set: toBoolean, type: Boolean}) authorized: boolean;

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussionsArray: Array<IDiscussionListItem> = [];
  private discussionsHashes: string[];
  private hasDiscussions: boolean;
  private commentTimeInterval: ReturnType<typeof setInterval>;
  private updateTimeSignal: "update-time";

  private get discussions(): Map<string, IDealDiscussion> {
    const discussionsMap = new Map();
    if (!this.deal) return discussionsMap;

    Object.entries(this.deal.clauseDiscussions).forEach(async ([id, discussion]) => {
      if (!discussion
        || (!discussion.replies && this.deal.isAuthenticatedRepresentativeOrLead)
        || (!discussion.publicReplies && !this.deal.isAuthenticatedRepresentativeOrLead)
      ) return;

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
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IRouter private router: IRouter,
    private dateService: DateService,
    private dealService: DealService,
    @IEthereumService private ethereumService: IEthereumService,
    private discussionsService: DiscussionsService,
    @ISignaler private bindingSignaler: ISignaler,
  ) {}

  attached(): void {
    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.initialize();
    });

    this.commentTimeInterval = setInterval((): void => {
      this.bindingSignaler.dispatchSignal(this.updateTimeSignal);
    }, 30000);
  }

  private initialize() {
    if (this.deal){
      this.discussionsService.loadDealDiscussions(this.deal.clauseDiscussions);
    }

    this.hasDiscussions = !!this.discussions.size;
  }

  detached() {
    clearInterval(this.commentTimeInterval);
  }

  private navigateTo(discussionId: string): void {
    this.discussionsService.autoScrollAfter(0);
    this.discussionId = discussionId;
  }
}
