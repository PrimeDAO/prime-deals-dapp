import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { IDiscussion, IComment, IProfile, VoteType, TCommentDictionary } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./discussionThread.scss";

@autoinject
export class DiscussionThread {
  @bindable discussionId: string;
  private comment = "";
  private isReply = false;
  private replyToOriginalMessage: IComment;
  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private threadProfiles: IProfile[] = [];
  private isLoading = "";
  private isAuthorized: boolean;
  private dealDiscussion: IDiscussion;
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

  constructor(
    private router: Router,
    private deal: DealTokenSwap,
    private dateService: DateService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
  ) {}

  async attached(): Promise<void> {
    this.isLoading = "isFetching";
    this.isAuthorized = this.checkIsAuthorized;
    this.discussionId = this.router.currentInstruction.params.discussionId;
    this.ensureDealDiscussion();

    this.dealDiscussion = this.deal.clauseDiscussions[this.discussionId];
  }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get checkIsAuthorized(): boolean {
    return !!this.ethereumService.defaultAccountAddress;
  }

  detached(): void {
    this.discussionsService.unsubscribeFromDiscussion();
  }

  private async ensureDealDiscussion() {
    this.discussionsService.loadDiscussionComments(this.discussionId).then(
      (comments: IComment[]) => {
        if (!comments || !Object.keys(comments).length) {
          this.isLoading = "";
          return {};
        }

        // Dictionary is used for replies, to easily find the comment by its id
        this.threadDictionary = comments.reduce(function(r, e) {
          r[e._id] = e;
          return r;
        }, {});
        this.threadComments = comments;

        // Subscribe for new comments and update the thread once a new comment is posted
        this.discussionsService.subscribeToDiscussion(this.discussionId);

        // Update the discussion status
        // Todo
        this.discussionsService.updateDiscussionListStatus(this.discussionId);

        this.isLoading = "";
      });
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
