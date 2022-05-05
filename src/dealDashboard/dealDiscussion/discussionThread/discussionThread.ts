import { AlertService } from "services/AlertService";
import { autoinject, computedFrom, bindable, bindingMode } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";

import { deletedByAuthorErrorMessage, DiscussionsService } from "dealDashboard/discussionsService";
import { Types } from "dealDashboard/discussionsStreamService";
import { Address, EthereumService } from "services/EthereumService";
import { DateService } from "services/DateService";
import { DealService } from "services/DealService";
import { Utils } from "services/utils";

import { IComment, IDealDiscussion, IProfile, TCommentDictionary, VoteType } from "entities/DealDiscussions";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IClause } from "entities/DealRegistrationTokenSwap";

import "./discussionThread.scss";

// import { Convo } from "@theconvospace/sdk";
import { ConsoleLogService } from "services/ConsoleLogService";

export type ILoadingTracker = {
  discussions: boolean;
  commenting: boolean;
  voting: Record<string, boolean>;
  replying: Record<string, boolean>;
} & Record<string, boolean | Record<string, boolean>>

@autoinject
export class DiscussionThread {
  @bindable clauses: Map<string, IClause>;
  @bindable({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;
  @bindable deal: DealTokenSwap;
  @bindable authorized: boolean;
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
  private isLoading: ILoadingTracker = {
    discussions: false,
    commenting: false,
    voting: {},
    replying: {},
  };
  private accountAddress: Address;
  private dealDiscussion: IDealDiscussion;
  private dealDiscussionComments: IComment[];
  private deletedComment: IComment = {
    _id: "",
    text: "This message has been removed.",
    author: "",
    authorENS: "",
    metadata: {
      isPrivate: undefined,
      encrypted: undefined,
      iv: undefined,
      isDeleted: true,
    },
    replyTo: "",
    upvotes: [""],
    downvotes: [""],
    createdOn: "0",
  };
  private hasApiError = false;

  constructor(
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private consoleLogService: ConsoleLogService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
    private alertService: AlertService,
  ) { }

  attached(): void {
    this.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.initialize();
    });
  }

  detached(): void {
    this.discussionsService.unsubscribeFromDiscussion();
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
    return (discussionsIds.indexOf(this.discussionId) + 1).toString() || "-";
  }

  @computedFrom("isLoading.discussions", "deal.isUserRepresentativeOrLead", "threadComments")
  private get noCommentsText(): string {
    if (!this.isLoading.discussions && !this.threadComments?.length) {
      return (!this.deal.isUserRepresentativeOrLead && this.deal.isPrivate)
        ? "This discussion is private."
        : "This discussion has no comments yet.";
    }
    return "";
  }

  private async initialize(isIdChange = false): Promise<void> {
    this.isLoading.discussions = true;
    if (!this.discussionId) {
      this.isLoading.discussions = false;
      return;
    }
    if (!this.threadComments) this.threadComments = [];
    if (
      !this.deal.isPrivate ||
      this.deal.isPrivate && this.deal.isUserRepresentativeOrLead
    ) {
      // Loads the discussion details - necessary for thread header
      this.dealDiscussion = this.deal.clauseDiscussions[this.discussionId];
      // Ensures comment fetching and subscription
      await this.ensureDealDiscussion(this.discussionId);
      if (this.isInView(this.refThread) && !isIdChange) {
        this.discussionsService.autoScrollAfter(0);
      }

      this.isLoading.discussions = false;
    } else {
      this.isLoading.discussions = false;
    }
  }

  private arrayToDictionary(comments: Array<any>): Record<string, IComment> {
    return comments.reduce((r, e): Record<string, IComment> => {
      if (e === undefined) {
        return r;
      }

      r[e._id] = e;
      return r;
    }, {});
  }

  private streamIDs = new Set();

  private async updateCommentsThreadUponMessageArrival(commentStreamMessage: Types.Message): Promise<void> {
    // If a new comment is added to the thread, it is added at the end of the comments array.
    if (this.streamIDs.has(commentStreamMessage.id)) {
      return;
    } else {
      if (this.streamIDs.size > 10) {
        const firstEntered = this.streamIDs.values().next();
        this.streamIDs.delete(firstEntered.value);

      }
      this.streamIDs.add(commentStreamMessage.id);
    }

    const newComment: IComment = Utils.cloneDeep(commentStreamMessage.data);

    if (commentStreamMessage.name === "commentDelete") {
      if (this.threadDictionary[newComment._id]) {
        this.threadComments = this.threadComments.filter(comment => comment._id !== newComment._id);
        this.threadDictionary = this.arrayToDictionary(this.threadComments);
      }
    } else {
      const key = await this.discussionsService.importKey(this.discussionId);

      const decrypted = await this.discussionsService.decryptWithAES(
        newComment.metadata.encrypted,
        newComment.metadata.iv,
        key,
      );
      if (newComment.metadata.encrypted) {
        newComment.text = decrypted;
      }
      this.threadDictionary[newComment._id] = {
        ...newComment,
      };
    }
    this.updateThreadsFromDictionary();
    this.updateDiscussionListStatus(new Date());

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
    commentStreamMessage = null;
  }

  private updateThreadsFromDictionary() {
    this.threadComments = Object
      .values(this.threadDictionary)
      /**
       * Handle bug, where values from `this.threadDictionary` are undefined.
       * Eg. {
       *   "id1": xyz,
       *   "id2": undefined
       * }
       */
      .filter(comment => comment !== undefined);
  }

  private async ensureDealDiscussion(discussionId: string): Promise<void> {
    try {
      this.threadComments = await this.discussionsService.loadDiscussionComments(discussionId, this.deal);

      this.hasApiError = false;

      // Early return, if there are no comments/discussions.
      if (!this.threadComments) return;
    } catch (error) {
      this.hasApiError = true;

      this.consoleLogService.logMessage(error.message, "error");
    }

    if (!this.dealDiscussion) return;

    this.updateDiscussionListStatus(new Date());
    this.isLoading.discussions = false;

    // Author profile for the discussion header
    this.isLoading[this.dealDiscussion.createdBy.address] = true;
    this.discussionsService.loadProfile(this.dealDiscussion.createdBy.address)
      .then(profile => {
        this.dealDiscussion.createdBy.name = profile.name || null;
        this.isLoading[this.dealDiscussion.createdBy.address] = false;
      });

    this.discussionsService.subscribeToDiscussion(this.discussionId, this.updateCommentsThreadUponMessageArrival.bind(this));

    if (!this.threadComments || !Object.keys(this.threadComments).length) return;

    // Dictionary is used for replies, to easily find the comment by its id
    this.threadDictionary = this.arrayToDictionary(this.threadComments);

    /* Comments author profiles */
    this.threadComments.forEach((comment: IComment) => {
      this.addAuthorToThreadProfiles(comment);
    });

    // Update the discussion status
    this.updateDiscussionListStatus(new Date(parseFloat(this.threadComments[this.threadComments.length - 1].createdOn)));
  }

  private isInView(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const vWidth = window.innerWidth || document.documentElement.clientWidth;
    const vHeight = window.innerHeight || document.documentElement.clientHeight;
    const efp = (x, y) => document.elementFromPoint(x, y);

    if (rect.height < 0 || rect.bottom < 0 ||
        rect.left > vWidth || rect.top > vHeight) return false;

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

  /**
   * Update the reply count and the last activity date of a discussion
   * @param discussionId string
   * @param timestamp Date
   * @returns void
   */
  private async updateDiscussionListStatus(timestamp: Date): Promise<void> {
    if (
      (
        this.dealDiscussion?.replies === this.threadComments?.length &&
        new Date(this.dealDiscussion.modifiedAt).getTime() <= timestamp?.getTime()
      ) || !this.discussionId
    ) return;

    this.dealDiscussion.replies = this.threadComments?.length || 0;
    this.dealDiscussion.publicReplies = this.threadComments?.filter(comment => comment.metadata.isPrivate === "false").length || 0;
    this.dealDiscussion.modifiedAt = timestamp.toISOString();
    this.threadDictionary = this.arrayToDictionary(this.threadComments);

    this.deal.addClauseDiscussion(
      this.discussionId,
      this.dealDiscussion,
    );
  }

  async addComment(): Promise<void> {
    if (this.isLoading.commenting) return;
    this.isLoading.commenting = true;
    try {
      const newComment:IComment = await this.discussionsService.addComment(
        this.discussionId,
        this.comment,
        this.deal.isPrivate,
        this.replyToComment?._id || "",
      );

      if (newComment) {
        this.threadComments.push({ ...newComment });
        this.addAuthorToThreadProfiles(newComment);

        this.updateDiscussionListStatus(new Date(parseFloat(newComment.createdOn)));
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

  private addAuthorToThreadProfiles(comment: IComment): void {
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
  }

  async replyComment(_id: string): Promise<void> {
    this.isLoading.replying[_id] = true;
    const comment = await this.discussionsService.getSingleComment(_id);
    this.isLoading.replying[_id] = false;

    /**
     * 1. "as any": Is typed as IComment, but the convoSdk also throws AbortController errors, so we catch it here.
     *   TODO: better describe return type from discussionsService.
     *
     * 2. DOMException: theconvo sdk throws this error.
     *   This happens, when there was no response from their endpoint within a timeout limit.
     *   Because, there was no response, we cannot assume what happened, so just early return with error popup.
     */
    if ((comment as any).error instanceof DOMException) {
      this.eventAggregator.publish("handleFailure", "An error occurred. Cannot reply to comment. Please try again later");
      return;
    }

    if (!comment._id) {
      this.eventAggregator.publish("handleFailure", `An error occurred. ${deletedByAuthorErrorMessage}`);
      this.threadComments = this.threadComments.filter(comment => comment._id !== _id);
      this.threadDictionary = this.arrayToDictionary(this.threadComments);
      return;
    }

    if (!this.replyToComment) {
      this.replyToComment = this.threadComments.find((comment) => comment._id === _id) || null;
      this.refCommentInput.querySelector("textarea").focus();
    } else {
      this.replyToComment = null;
    }
  }

  async voteComment(_id: string, type: VoteType): Promise<void> {
    const types = ["toggleUpvote", "toggleDownvote"];
    const endpoints = {toggleUpvote: "upvotes", toggleDownvote: "downvotes"};
    const typeInverse = types[types.length - types.indexOf(type.toString()) - 1];
    const currentWalletAddress = this.ethereumService.defaultAccountAddress;

    if (this.isLoading.voting[_id]) return;
    this.isLoading.voting[_id] = true;

    const swrVote = Utils.cloneDeep(this.threadDictionary[_id]);

    this.discussionsService.voteComment(this.discussionId, _id, type)
      .catch(error => {
        /* On API failure- revert voting */
        if (error.code === 404) {
          if (error.error) {
            this.eventAggregator.publish("handleFailure", "An error occurred while voting." + error.error);
            /**
             * Only revert vote action, when api error occured.
             * In this case, it was very likely, that the comment was deleted by the original author (note error code 404)
             */
            this.threadComments = this.threadComments.filter(comment => comment._id !== _id);
            this.threadDictionary = this.arrayToDictionary(this.threadComments);
          }
        } else {
          if (error.code === 4001) {
            this.eventAggregator.publish("handleFailure", "Signature is needed in order to like/dislike a comment. ");
          } else {
            this.eventAggregator.publish("handleFailure", "An error occurred. Like action reverted.");
          }

          /**
           * In this case, no API error, so just revert the vote.
           */
          this.threadDictionary[_id] = swrVote;
          this.updateThreadsFromDictionary();
        }
      }).finally(() => {
        this.isLoading.voting[_id] = false;
      });

    /* Toggle vote locally */
    const message = Utils.cloneDeep(this.threadDictionary[_id]);
    if (!message[endpoints[type]].includes(currentWalletAddress)) {
      message[endpoints[type]].push(currentWalletAddress);
      message[endpoints[typeInverse]] = message[endpoints[typeInverse]].filter(address => address !== currentWalletAddress);
    } else {
      message[endpoints[type]] = message[endpoints[type]].filter(address => address !== currentWalletAddress);
    }

    this.threadDictionary[_id] = message;
    this.updateThreadsFromDictionary();
  }

  private removeCommentFromThread(_id: string): void {
    this.threadComments = this.threadComments.filter(comment => comment._id !== _id);
    this.threadDictionary = this.arrayToDictionary(this.threadComments);
  }

  async deleteComment(_id: string): Promise<void> {
    if (this.isLoading[`isDeleting ${_id}`]) return;

    const result = await this.alertService.showAlert({
      header: "You will be deleting your comment and will not be able to recover it.",
      message: "Are you sure you want to delete your comment?",
      buttons: 3,
      buttonTextPrimary: "Delete my comment",
      buttonTextSecondary: "Keep my comment",
    });

    if (result.wasCancelled) {
      return;
    }

    this.isLoading[`isDeleting ${_id}`] = true;
    this.discussionsService.deleteComment(this.discussionId, _id).then(() => {
      this.removeCommentFromThread(_id);
    }).catch ((err) => {
      this.eventAggregator.publish("handleFailure", `An error occurred while deleting the comment. ${err.message}`);
    }).finally(() => {
      this.updateDiscussionListStatus(new Date());
      this.isLoading[`isDeleting ${_id}`] = false;
    });
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
