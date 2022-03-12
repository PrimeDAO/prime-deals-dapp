import { EventType } from "./../../services/constants";
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
  private accountAddress: Address;
  private atTop = false;
  private comment = "";
  private dealDiscussion: IDealDiscussion;
  private dealDiscussionComments: IComment[];
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
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private isAuthorized: boolean;
  private isLoading: Record<string, boolean> = {};
  private isMember = false;
  private isReply = false;
  private refCommentInput: HTMLTextAreaElement;
  private refComments = [];
  private refThread: HTMLElement;
  private refThreadEnd: HTMLSpanElement;
  private refTitle: HTMLElement;
  private replyToOriginalMessage: IComment;
  private scrollEvent: EventListener;
  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private threadProfiles: Record<string, IProfile> = {};

  @bindable public deal: DealTokenSwap;
  @bindable public discussionId: string;

  constructor(
    private router: Router,
    private dateService: DateService,
    private dealService: DealService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) { }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get checkIsAuthorized(): boolean {
    return !!this.ethereumService.defaultAccountAddress;
  }

  @computedFrom("discussionsService.comments")
  private get comments(): Array<IComment> {
    return this.discussionsService.comments;
  }

  public async addComment(): Promise<void> {
    if (this.isLoading.commenting) return;
    this.isLoading.commenting = true;
    try {
      this.threadComments = await this.discussionsService.addComment(
        this.discussionId,
        this.comment,
        this.deal.registrationData.isPrivate,
        [
          this.deal.registrationData.proposalLead.address,
          ...this.deal.registrationData.primaryDAO?.representatives.map((item => item.address)) || "",
          ...this.deal.registrationData.partnerDAO?.representatives.map((item => item.address)) || "",
        ],
        this.replyToOriginalMessage ? this.replyToOriginalMessage._id : null,
      );
      this.threadDictionary = this.arrayToDictionary(this.threadComments);
      this.comment = "";

      this.refThreadEnd.scrollIntoView({
        behavior: "smooth",
      });
      this.isReply = false;
    } catch (err) {
      this.eventAggregator.publish(EventType.HandleFailure, "Your signature is needed in order to vote");
    } finally {
      this.isLoading.commenting = false;
    }
  }

  public attached(): void {
    this.initialize();
    this.eventAggregator.subscribe(EventType.NetworkChangedAccount, (): void => {
      this.initialize();
    });

    this.scrollEvent = () => {
      this.atTop = (this.refTitle.getBoundingClientRect().y) <= 95;
    };

    document.addEventListener("scroll", this.scrollEvent);
  }

  public closeReply() {
    this.isReply = false;
    this.replyToOriginalMessage = null;
  }

  public async deleteComment(_id: string): Promise<void> {
    if (this.isLoading[`isDeleting ${_id}`]) return;
    this.isLoading[`isDeleting ${_id}`] = true;
    try {
      this.threadComments = await this.discussionsService.deleteComment(this.discussionId, _id);
    } catch (err) {
      this.eventAggregator.publish(EventType.HandleFailure, "Your signature is needed in order to vote");
    } finally {
      this.isLoading[`isDeleting ${_id}`] = false;
    }
  }

  public detached(): void {
    this.unsubscribeFromDiscussion();
    document.removeEventListener("scroll", this.scrollEvent);
  }

  public discussionIdChanged() {
    if (this.deal) {
      this.initialize(true);
    }
  }

  public async doAction(action: string, args: any): Promise<void> {
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

  public loadMoreComments() {
    // TODO
  }

  public async replyComment(_id: string): Promise<void> {
    this.isReply = !this.isReply;
    if (this.isReply) {
      this.refCommentInput.querySelector("textarea").focus();
    }

    this.replyToOriginalMessage = this.threadComments.find((comment) => comment._id === _id);
  }

  public async voteComment(_id: string, type: VoteType): Promise<void> {
    if (this.isLoading[`isVoting ${_id}`]) return;
    this.isLoading[`isVoting ${_id}`] = true;
    try {
      this.threadComments = await this.discussionsService.voteComment(this.discussionId, _id, type);
    }
    catch (err) {
      this.eventAggregator.publish(EventType.HandleFailure, "Your signature is needed in order to vote");
    } finally {
      this.isLoading[`isVoting ${_id}`] = false;
    }
  }

  private arrayToDictionary(comments): Record<string, IComment> {
    return comments.reduce(function(r, e) {
      r[e._id] = e;
      return r;
    }, {});
  }

  private async ensureDealDiscussion(discussionId: string): Promise<void> {
    this.threadComments = await this.discussionsService.loadDiscussionComments(discussionId);
    this.isLoading.discussions = false;

    if (this.threadComments && this.dealDiscussion) {
      this.subscribeToDiscussion(discussionId);

      if (!this.threadComments || !Object.keys(this.threadComments).length) return;

      // Dictionary is used for replies, to easily find the comment by its id
      this.threadDictionary = this.threadComments.reduce((r, e): Record<string, IComment> => {
        r[e._id] = e;
        return r;
      }, {});

      // Author profile for the discussion header
      this.isLoading[this.dealDiscussion.createdBy.address] = true;
      this.discussionsService.loadProfile(this.dealDiscussion.createdBy.address)
        .then(profile => {
          this.dealDiscussion.createdByName = profile.name || null;
          this.isLoading[this.dealDiscussion.createdBy.address] = false;
        });

      /* Comments author profiles */
      this.threadComments.forEach((comment: IComment) => {
        if (!this.threadProfiles[comment.author]) {
          this.isLoading[comment.author] = true;
          if (comment.authorName /* author has ENS name */) {
            this.threadProfiles[comment.author] = {
              name: comment.authorName,
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
      this.discussionsService.updateDiscussionListStatus(discussionId);
    }
  }

  private async initialize(isIdChange = false): Promise<void> {
    this.isLoading.discussions = true;

    this.isAuthorized = this.checkIsAuthorized;

    // Only member (representatives) can add a comments to a discussion
    this.isMember = (
      [
        this.deal.registrationData.proposalLead.address,
        ...this.deal.registrationData.primaryDAO?.representatives.map(item => item.address) || "",
        ...this.deal.registrationData.partnerDAO?.representatives.map(item => item.address) || "",
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
      this.dealDiscussion = await this.discussionsService.discussions[this.discussionId];

      // Ensures comment fetching and subscription
      await this.ensureDealDiscussion(this.discussionId);
      if (this.discussionId && this.isInView(this.refThread) && !isIdChange) {
        this.discussionsService.autoScrollAfter(0);
      }

    } else {
      this.isLoading.discussions = false;
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

  private navigateTo() {
    this.discussionId = null;
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

  private updateCommentsThreadUponMessageArrival(comment: Types.Message): void {
    // If a new comment is added to the thread, it is added at the end of the comments array.
    if (!this.threadDictionary[comment.name]) {
      this.discussionsService.importKey(this.discussionId).then(key => {
        if (comment.data.metadata.encrypted) {
          this.discussionsService.decryptWithAES(
            comment.data.metadata.encrypted,
            comment.data.metadata.iv,
            key,
          ).then( (decryptedComment) => {
            comment.data.text = decryptedComment;
            this.threadComments.push(comment.data);
            this.discussionsService.updateDiscussionListStatus(this.discussionId, new Date(comment.timestamp));
            this.threadDictionary = this.arrayToDictionary(this.threadComments);

            // scroll to bottom only if the user is at seeing the last message
            if (this.refComments && this.isInView(this.refComments[this.refComments.length - 1])) {
              this.refThreadEnd.scrollIntoView({
                behavior: "smooth",
              });
            }
            this.isLoading.commenting = false;
          });
        }
      });
    }
  }

}
