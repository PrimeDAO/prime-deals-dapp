import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IDiscussion, IComment, EVote } from "dealDashboard/discussionsService";
import { DateService } from "services/DateService";
import "./discussionThread.scss";

type TCommentDictionary = {
  [key: string]: IComment
}

@autoinject
export class DiscussionThread {
  dealDiscussion: IDiscussion;
  dealDiscussionComments: IComment[];
  @bindable discussionId: string;
  private isReply = false;
  private replyToOriginalMessage: IComment;

  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private comment = "";
  private isLoading = "";
  private isAuthorized: boolean;

  constructor(
    private router: Router,
    private dateService: DateService,
    private discussionsService: DiscussionsService,
    private ethereumService: EthereumService,
  ) {}

  attached(): void {
    this.isLoading = "isFetching";
    this.isAuthorized = this.checkIsAuthorized;
    this.discussionId = this.router.currentInstruction.params.discussionId;
    this.ensureDealDiscussion();
    this.discussionsService.loadDiscussion(this.discussionId).then(
      (comments: IComment[]) => {
        this.threadComments = comments;
        // Dictionary is used for replies, to easily find the comment by its id
        this.threadDictionary = comments.reduce(function(r, e) {
          r[e._id] = e;
          return r;
        }, {});

        // Subscribe for new comments and update the thread once a new comment is posted
        this.discussionsService.subscribeToDiscussion(this.discussionId);

        // Update the discussion status
        // Todo
        this.discussionsService.updateDiscussionListStatus(this.discussionId);

        this.isLoading = "";
      });
  }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get checkIsAuthorized(): boolean {
    return !!this.ethereumService.defaultAccountAddress;
  }

  detached(): void {
    this.discussionsService.unsubscribeFromDiscussion();
  }

  private async ensureDealDiscussion() {
    this.dealDiscussion = await this.discussionsService.getDiscussionInfo(this.discussionId);
  }

  loadMoreComments() {
    // TODO
  }

  async dealClauseIdChanged() {
    await this.discussionsService.loadDiscussion(this.discussionId);
    this.threadComments = this.discussionsService.comments;
  }

  async addComment(): Promise<void> {
    this.isLoading = "commenting";
    this.threadComments = await this.discussionsService.postCommentToConvo(
      this.discussionId,
      this.comment,
      this.replyToOriginalMessage ? this.replyToOriginalMessage._id : null,
    );
    this.comment = "";
    this.isLoading = "";
    this.isReply = false;
  }

  async replyComment(_id: string): Promise<void> {
    // console.log("replyComment");
    this.isReply = !this.isReply;
    this.replyToOriginalMessage = this.threadComments.find((comment) => comment._id === _id);
    // console.log(this.threadComments, this.replyToOriginalMessage);
  }

  async voteComment(_id: string, type: EVote): Promise<void> {
    this.isLoading = `isVoting ${_id}`;
    this.threadComments = await this.discussionsService.voteMessage(this.discussionId, _id, type);
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
