import { autoinject, computedFrom, bindable, bindingMode } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";

import { DiscussionsService } from "dealDashboard/discussionsService";
import { Address, AllowedNetworks, EthereumService } from "services/EthereumService";
import { DateService } from "services/DateService";
import { DealService } from "services/DealService";

import { IComment, IDealDiscussion, IProfile, TCommentDictionary, VoteType } from "entities/DealDiscussions";
import { DealTokenSwap } from "entities/DealTokenSwap";

import "./discussionThread.scss";

// import { Convo } from "@theconvospace/sdk";
import { Realtime } from "ably/promises";
import { Types } from "ably";

@autoinject
export class DiscussionThread {
  @bindable({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;
  @bindable deal: DealTokenSwap;
  private refThread: HTMLElement;
  private refThreadEnd: HTMLSpanElement;
  private refTitle: HTMLElement;
  private refComments = [];
  private refCommentInput: HTMLTextAreaElement;
  private atTop = false;
  private scrollEvent: EventListener;
  private comment = "";
  private replyToComment: IComment;
  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private threadProfiles: Record<string, IProfile> = {};
  private isLoading: Record<string, boolean> = {};
  // private isAuthorized: boolean;
  // private isMember = false;
  private accountAddress: Address;
  private dealDiscussion: IDealDiscussion;
  private dealDiscussionComments: IComment[];
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private deletedComment: IComment = {
    _id: "",
    text: "This message has been removed.",
    author: "",
    authorENS: "",
    metadata: {
      isDeleted: true,
    },
    replyTo: "",
    upvotes: [""],
    downvotes: [""],
    createdOn: "0",
  };

  constructor(
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) { }

  attached(): void {
    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.initialize();
    });
  }

  detached(): void {
    this.unsubscribeFromDiscussion();
    document.removeEventListener("scroll", this.scrollEvent);
  }

  discussionIdChanged() {
    if (this.deal && this.discussionId) {
      this.initialize(true);
    }
  }

  @computedFrom("deal.clauseDiscussions", "dealDiscussion")
  private get clauseIndex(): string {
    const discussionsIds = this.deal?.registrationData?.terms?.clauses.map(clause => clause.id);
    return (discussionsIds.indexOf(this.dealDiscussion.discussionId) + 1).toString() || "-";
  }

  @computedFrom("isLoading.discussions", "deal.isUserRepresentativeOrLead", "threadComments")
  private get noCommentsText(): string {
    if (!this.isLoading.discussions && !this.threadComments?.length) {
      return (!this.deal.isUserRepresentativeOrLead && this.deal.registrationData.isPrivate)
        ? "This discussion is private."
        : "This discussion has no comments yet.";
    }
    return "";
  }

  private async initialize(isIdChange = false): Promise<void> {
    this.isLoading.discussions = true;

    // Only member (representatives) can add a comments to a discussion
    // this.isMember = (
    //   [
    //     this.deal.registrationData.proposalLead.address,
    //     ...this.deal.registrationData.primaryDAO?.representatives.map(item => item.address) || "",
    //     ...this.deal.registrationData.partnerDAO?.representatives.map(item => item.address) || "",
    //   ].includes(this.ethereumService.defaultAccountAddress)
    // );

    // Only members should see the discussion if is private
    // this.isAuthorized = this.deal.isUserRepresentativeOrLead;
    // (
    //   !this.deal.registrationData.isPrivate ||
    //   (this.deal.registrationData.isPrivate && this.isMember)
    // );

    if (this.deal.isUserRepresentativeOrLead) {
      // Loads the discussion details - necessary for thread header
      this.dealDiscussion = this.deal.clauseDiscussions.get(this.discussionId);

      // Ensures comment fetching and subscription
      await this.ensureDealDiscussion(this.discussionId);
      if (this.discussionId && this.isInView(this.refThread) && !isIdChange) {
        this.discussionsService.autoScrollAfter(0);
      }

    } else {
      this.isLoading.discussions = false;
    }
  }

  private arrayToDictionary(comments): Record<string, IComment> {
    return comments.reduce((r, e): Record<string, IComment> => {
      r[e._id] = e;
      return r;
    }, {});
  }

  private async updateCommentsThreadUponMessageArrival(comment: Types.Message): Promise<void> {
    // If a new comment is added to the thread, it is added at the end of the comments array.
    this.threadDictionary = this.arrayToDictionary(this.threadComments);

    const newComment: IComment = {...comment.data};

    if (!this.threadDictionary[newComment._id]) {
      const key = await this.discussionsService.importKey(this.discussionId);

      newComment.text = (newComment.metadata.encrypted) ?
        await this.discussionsService.decryptWithAES(
          newComment.metadata.encrypted,
          newComment.metadata.iv,
          key,
        ) :
        newComment.text;

      this.threadDictionary[newComment._id] = {
        ...newComment,
      };
      this.threadComments = Object.values(this.threadDictionary);

      // scroll to bottom only if the user is at seeing the last message
      if (
        this.refComments
        && this.refComments[this.refComments.length - 1]
        && this.isInView(this.refComments[this.refComments.length - 1])) {
        this.refThreadEnd.scrollIntoView({
          behavior: "smooth",
        });
      }
      this.isLoading.commenting = false;
      comment = null;
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
    this.threadComments = await this.discussionsService.loadDiscussionComments(discussionId);
    this.isLoading.discussions = false;

    // Author profile for the discussion header
    this.isLoading[this.dealDiscussion.createdBy.address] = true;
    this.discussionsService.loadProfile(this.dealDiscussion.createdBy.address)
      .then(profile => {
        this.dealDiscussion.createdBy.name = profile.name || null;
        this.isLoading[this.dealDiscussion.createdBy.address] = false;
      });

    if (this.threadComments && this.dealDiscussion) {
      this.subscribeToDiscussion(discussionId);

      if (!this.threadComments || !Object.keys(this.threadComments).length) return;

      // Dictionary is used for replies, to easily find the comment by its id
      this.threadDictionary = this.arrayToDictionary(this.threadComments);

      /* Comments author profiles */
      this.threadComments.forEach((comment: IComment) => {
        if (!this.threadProfiles[comment.author]) {
          this.isLoading[comment.author] = true;
          if (comment.authorENS /* author has ENS name */) {
            this.threadProfiles[comment.author] = {
              name: comment.authorENS,
              address: comment.author,
              image: "",
            };
          } else {
            /* required for replies */
            this.discussionsService.loadProfile(comment.author).then(profile => {
              this.threadProfiles[comment.author] = profile;
              this.isLoading[comment.author] = false;
            });
          }
        }
      });

      // Update the discussion status
      this.discussionsService.updateDiscussionListStatus(
        discussionId,
        new Date(parseFloat(this.threadComments[this.threadComments.length - 1].createdOn)),
        this.threadComments.length,
      );
    }
  }

  private isInView(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
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
    if (this.isLoading.commenting) return;
    this.isLoading.commenting = true;
    try {
      const newComment:IComment = await this.discussionsService.addComment(
        this.discussionId,
        this.comment,
        this.deal.registrationData.isPrivate,
        [
          this.deal.registrationData.proposalLead.address,
          ...this.deal.registrationData.primaryDAO?.representatives.map((item => item.address)) || "",
          ...this.deal.registrationData.partnerDAO?.representatives.map((item => item.address)) || "",
        ],
        this.replyToComment?._id || "",
      );

      if (newComment) {
        this.threadComments.push({ ...newComment });

        this.discussionsService
          .updateDiscussionListStatus(
            this.discussionId,
            new Date(parseFloat(newComment.createdOn)),
            this.threadComments.length,
          );
      }
      this.threadDictionary = this.arrayToDictionary(this.threadComments);
      this.comment = "";

      this.refThreadEnd.scrollIntoView({
        behavior: "smooth",
      });
      this.replyToComment = null;
    } catch (err) {
      this.eventAggregator.publish("handleFailure", "An error occurred while adding a comment. " + err.message);
    } finally {
      this.isLoading.commenting = false;
    }
  }

  async replyComment(_id: string): Promise<void> {
    if (!this.replyToComment) {
      this.replyToComment = this.threadComments.find((comment) => comment._id === _id) || null;
      this.refCommentInput.querySelector("textarea").focus();
    } else {
      this.replyToComment = null;
    }
  }

  async voteComment(_id: string, type: VoteType): Promise<void> {
    if (this.isLoading[`isVoting ${_id}`]) return;
    this.isLoading[`isVoting ${_id}`] = true;
    try {
      const message = await this.discussionsService.voteComment(this.discussionId, _id, type) as IComment;
      if (message) {
        const commentIndex = this.threadComments.findIndex(comment => comment._id === message._id);
        this.threadComments[commentIndex].upvotes = message.upvotes;
        this.threadComments[commentIndex].downvotes = message.downvotes;
        this.discussionsService.updateDiscussionListStatus(this.discussionId, new Date(), this.threadComments.length);
      }
    }
    catch (err) {
      this.eventAggregator.publish("handleFailure", "Your signature is needed in order to vote");
    } finally {
      this.isLoading[`isVoting ${_id}`] = false;
    }
  }

  async deleteComment(_id: string): Promise<void> {
    if (this.isLoading[`isDeleting ${_id}`]) return;
    this.isLoading[`isDeleting ${_id}`] = true;
    try {
      const swrComments = [...this.threadComments];
      this.threadComments = this.threadComments.filter(comment => comment._id !== _id);
      if (!(await this.discussionsService.deleteComment(this.discussionId, _id))) {
        /* on error, restore original comments */
        this.threadComments = [...swrComments];
      }
      this.discussionsService.updateDiscussionListStatus(this.discussionId, new Date(), this.threadComments.length);
    } catch (err) {
      this.eventAggregator.publish("handleFailure", "Your signature is needed in order to delete a comment");
    } finally {
      this.isLoading[`isDeleting ${_id}`] = false;
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
    this.replyToComment = null;
  }

  private navigateTo() {
    this.discussionId = null;
  }
}
