import { EthereumService, AllowedNetworks } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { IDealDiscussion, IComment, IProfile, VoteType, TCommentDictionary } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./discussionThread.scss";
// import { Convo } from "@theconvospace/sdk";
import { Realtime } from "ably/promises";
import { Types } from "ably";

@autoinject
export class DiscussionThread {
  @bindable discussionId: string;
  private deal: DealTokenSwap;
  private dealId: string;
  private comment = "";
  private isReply = false;
  private replyToOriginalMessage: IComment;
  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private threadProfiles: IProfile[] = [];
  private isLoading = "";
  private isAuthorized: boolean;
  private isMember = false;
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
  ) {}

  @computedFrom("discussionsService.comments")
  private get comments(): Array<IComment> {
    return this.discussionsService.comments;
  }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get checkIsAuthorized(): boolean {
    return !!this.ethereumService.defaultAccountAddress;
  }

  async attached(): Promise<void> {
    this.isLoading = "isFetching";

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
        ...this.deal.registrationData.primaryDAO.members,
        ...this.deal.registrationData.partnerDAO.members,
      ].includes(this.ethereumService.defaultAccountAddress)
    );

    // Only members should see the discussion if is private
    this.isAuthorized = (
      this.deal.registrationData.isPrivate &&
      this.isMember
    );

    if (this.isAuthorized) {
      // Loads the discussion details - necessary for thread header
      this.discussionsService.loadDealDiscussions(this.deal.clauseDiscussions);
      this.dealDiscussion = this.discussionsService.discussions[this.discussionId];

      // Ensures comment fetching and subscription
      this.ensureDealDiscussion(this.discussionId);
    } else {
      this.isLoading = "";
    }
  }

  detached(): void {
    this.unsubscribeFromDiscussion();
  }

  private updateCommentsThreadUponMessageArrival(comment: Types.Message) {
    // If a new comment is added to the thread, it is added at the end of the comments array.
    if (!this.comments.some(item => item._id === comment.name)) {
      this.threadComments.push(comment.data);
      this.discussionsService.updateDiscussionListStatus(this.discussionId, new Date(comment.timestamp));

      this.threadDictionary = this.comments.reduce(function(r, e) {
        r[e._id] = e;
        return r;
      }, {});
    }
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
    this.isLoading = "";
    this.subscribeToDiscussion(this.discussionId);

    if (!comments || !Object.keys(comments).length) return;

    this.threadComments = comments;
    // Dictionary is used for replies, to easily find the comment by its id
    this.threadDictionary = comments.reduce(function(r, e) {
      r[e._id] = e;
      return r;
    }, {});

    // Update the discussion status
    this.discussionsService.updateDiscussionListStatus(discussionId);
  }

  loadMoreComments() {
    // TODO
  }

  async addComment(): Promise<void> {
    this.isLoading = "commenting";
    this.threadComments = await this.discussionsService.addComment(
      this.discussionId,
      this.comment,
      this.replyToOriginalMessage ? this.replyToOriginalMessage._id : null,
    );
    this.comment = "";
    this.isLoading = "";
    this.isReply = false;
  }

  async replyComment(_id: string): Promise<void> {
    this.isReply = !this.isReply;
    this.replyToOriginalMessage = this.threadComments.find((comment) => comment._id === _id);
  }

  async voteComment(_id: string, type: VoteType): Promise<void> {
    this.isLoading = `isVoting ${_id}`;
    this.threadComments = await this.discussionsService.voteComment(this.discussionId, _id, type);
    this.isLoading = "";
  }

  async deleteComment(_id: string): Promise<void> {
    this.threadComments = await this.discussionsService.deleteComment(this.discussionId, _id);
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
