import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";

import { DiscussionsService } from "dealDashboard/discussionsService";
import { EthereumService, AllowedNetworks, Address } from "services/EthereumService";
import { DateService } from "services/DateService";
import { DealService } from "services/DealService";

import { IDealDiscussion, IComment, IProfile, VoteType, TCommentDictionary } from "entities/DealDiscussions";
import { DealTokenSwap } from "entities/DealTokenSwap";

import "./discussionThread.scss";

// import { Convo } from "@theconvospace/sdk";
import { Realtime } from "ably/promises";
import { Types } from "ably";

@autoinject
export class DiscussionThread {
  @bindable discussionId: string;
  private refThread: HTMLElement;
  private refThreadEnd: HTMLSpanElement;
  private refCommentInput: HTMLTextAreaElement;
  private deal: DealTokenSwap;
  private dealId: string;
  private comment = "";
  private isReply = false;
  private replyToOriginalMessage: IComment;
  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private threadProfiles: Record<string, IProfile> = {};
  private isLoading: Record<string, boolean> = {};
  private isAuthorized: boolean;
  private isMember = false;
  private accountAddress: Address;
  private dealDiscussion: IDealDiscussion;
  private dealDiscussionComments: IComment[];
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private deletedComment: IComment = {
    _id: "",
    text: "This message has been removed.",
    author: "",
    authorName: "",
    metadata: {
      isDeleted: true,
    },
    replyTo: "",
    upvotes: [""],
    downvotes: [""],
    timestamp: 0,
  };

  constructor(
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) { }

  @computedFrom("discussionsService.comments")
  private get comments(): Array<IComment> {
    return this.discussionsService.comments;
  }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get checkIsAuthorized(): boolean {
    return !!this.ethereumService.defaultAccountAddress;
  }

  attached(): void {
    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.initialize();
    });
  }

  detached(): void {
    this.unsubscribeFromDiscussion();
  }

  private async initialize(): Promise<void> {
    this.isLoading.discussions = true;

    this.isAuthorized = this.checkIsAuthorized;
    this.dealId = this.router.currentInstruction.parentInstruction.params.address;
    this.discussionId = this.router.currentInstruction.params.discussionId;

    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();

    // Only member (representatives) can add a comments to a discussion
    this.isMember = (
      [
        this.deal.registrationData.proposalLead.address,
        ...this.deal.registrationData.primaryDAO?.members || "",
        ...this.deal.registrationData.partnerDAO?.members || "",
      ].includes(this.ethereumService.defaultAccountAddress)
    );

    // Only members should see the discussion if is private
    this.isAuthorized = (
      !this.deal.registrationData.isPrivate ||
      (this.deal.registrationData.isPrivate && this.isMember)
    );

    if (this.isAuthorized) {
      // Loads the discussion details - necessary for thread header
      this.discussionsService.loadDealDiscussions(this.deal.clauseDiscussions);
      this.dealDiscussion = this.discussionsService.discussions[this.discussionId];

      // Ensures comment fetching and subscription
      this.ensureDealDiscussion(this.discussionId);
    } else {
      this.isLoading.discussions = false;
    }
  }

  private updateCommentsThreadUponMessageArrival(comment: Types.Message): void {
    // If a new comment is added to the thread, it is added at the end of the comments array.
    if (!this.comments.some(item => item._id === comment.name)) {
      this.threadComments.push(comment.data);
      this.discussionsService.updateDiscussionListStatus(this.discussionId, new Date(comment.timestamp));

      this.threadDictionary = this.comments.reduce(function(r, e) {
        r[e._id] = e;
        return r;
      }, {});
    }
    this.refThreadEnd.scrollIntoView({
      behavior: "smooth",
    });
    this.isLoading.commenting = false;
  }

  private async subscribeToDiscussion(discussionId: string): Promise<void> {
    const channelName = `${discussionId}:${this.discussionsService.getNetworkId(process.env.NETWORK as AllowedNetworks)}`;

    // const convo = new Convo(process.env.CONVO_API_KEY);
    // const res = convo.threads.subscribe(channelName, this.updateThread);
    // console.log({res});

    const ably = new Realtime.Promise({ authUrl: `https://theconvo.space/api/getAblyAuth?apikey=${ process.env.CONVO_API_KEY }` });
    this.discussionCommentsStream = await ably.channels.get(channelName);
    this.discussionCommentsStream.subscribe((comment: Types.Message) => this.updateCommentsThreadUponMessageArrival(comment));
  }

  private unsubscribeFromDiscussion(): void {
    if (this.discussionCommentsStream) {
      this.discussionCommentsStream.unsubscribe();
    }
  }

  private async ensureDealDiscussion(discussionId: string): Promise<void> {
    const comments = await this.discussionsService.loadDiscussionComments(discussionId);
    this.isLoading.discussions = false;

    this.subscribeToDiscussion(this.discussionId);

    if (!comments || !Object.keys(comments).length) return;

    this.threadComments = comments;
    // Dictionary is used for replies, to easily find the comment by its id
    this.threadDictionary = await comments.reduce((r, e): Record<string, IComment> => {
      r[e._id] = e;
      return r;
    }, {});

    // Author profile for the discussion header
    this.discussionsService.loadProfile(this.dealDiscussion.createdByAddress)
      .then(profile => {
        this.dealDiscussion.createdByName = profile.name;
      });

    // Comments author profiles
    this.isLoading.profiles = true;
    this.threadComments.forEach(async (comment: IComment) => {
      if (!this.threadProfiles[comment.author]) {
        const profile = await this.discussionsService.loadProfile(comment.author);
        this.threadProfiles[profile.address] = profile;
      }
    });
    this.isLoading.profiles = false;

    if (this.threadIsInView()) {
      setTimeout(() => {
        window.scrollTo({
          left: 0,
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 250);
    }

    // Update the discussion status
    this.discussionsService.updateDiscussionListStatus(discussionId);
  }

  threadIsInView() {
    const rect = this.refThread.getBoundingClientRect();
    const vWidth = window.innerWidth || document.documentElement.clientWidth;
    const vHeight = window.innerHeight || document.documentElement.clientHeight;
    const efp = (x, y) => document.elementFromPoint(x, y);

    if (rect.height < 0 || rect.bottom < 0 ||
        rect.left > vWidth || rect.top > vHeight)
      return false;

    return (
      this.refThread.contains(efp(rect.left, rect.top)) ||
      this.refThread.contains(efp(rect.right, rect.top)) ||
      this.refThread.contains(efp(rect.right, rect.bottom)) ||
      this.refThread.contains(efp(rect.left, rect.bottom))
    );
  }

  loadMoreComments() {
    // TODO
  }

  async addComment(): Promise<void> {
    this.isLoading.commenting = true;
    try {
      this.threadComments = await this.discussionsService.addComment(
        this.discussionId,
        this.comment,
        this.deal.registrationData.isPrivate,
        [
          this.deal.registrationData.proposalLead.address,
          ...this.deal.registrationData.primaryDAO?.members || "",
          ...this.deal.registrationData.partnerDAO?.members || "",
        ],
        this.replyToOriginalMessage ? this.replyToOriginalMessage._id : null,
      );
      this.comment = "";

      setTimeout(() => {
        this.isLoading.commenting = false;
      }, 5000);
      this.refThreadEnd.scrollIntoView({
        behavior: "smooth",
      });
      this.isReply = false;
    } catch (err) {
      this.eventAggregator.publish("handleFailure", "Your signature is needed in order to vote");
      this.isLoading.commenting = false;
    }
  }

  async replyComment(_id: string): Promise<void> {
    this.isReply = !this.isReply;
    if (this.isReply) {
      this.refCommentInput.querySelector("textarea").focus();
    }

    this.replyToOriginalMessage = this.threadComments.find((comment) => comment._id === _id);
  }

  async voteComment(_id: string, type: VoteType): Promise<void> {
    this.isLoading[`isVoting ${_id}`] = true;
    try {
      this.threadComments = await this.discussionsService.voteComment(this.discussionId, _id, type);
    }
    catch (err) {
      this.eventAggregator.publish("handleFailure", "Your signature is needed in order to vote");
    } finally {
      this.isLoading[`isVoting ${_id}`] = false;
    }
  }

  async deleteComment(_id: string): Promise<void> {
    try {
      this.threadComments = await this.discussionsService.deleteComment(this.discussionId, _id);
    } catch (err) {
      this.eventAggregator.publish("handleFailure", "Your signature is needed in order to vote");
    }
  }

  async doAction(action: string, args: any): Promise<void> {
    switch (action) {
      case "reply":
        this.replyComment(args._id);
        break;
      case "vote":
        this.voteComment(args._id, args.vote);
        break;
      case "delete":
        this.deleteComment(args._id);
        break;
    }
  }

  closeReply() {
    this.isReply = false;
    this.replyToOriginalMessage = null;
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
