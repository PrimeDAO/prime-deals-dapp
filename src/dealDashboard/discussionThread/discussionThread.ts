import { autoinject, bindable } from "aurelia-framework";
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
  @bindable dealClauseId: string;
  private isReply = false;
  private replyToOriginalMessage: IComment;

  private threadComments: IComment[] = [];
  private threadDictionary: TCommentDictionary = {};
  private comment = "";
  private isLoading = "";

  constructor(
    private router: Router,
    private dateService: DateService,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.isLoading = "isFetching";
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
    this.ensureDealDiscussion();
    this.discussionsService.loadDiscussion(this.dealClauseId).then(
      (comments: IComment[]) => {
        this.threadComments = comments;
        this.discussionsService.subscribeToDiscussion(this.dealClauseId);
        this.threadDictionary = comments.reduce(function(r, e) {
          r[e._id] = e;
          return r;
        }, {});
        this.isLoading = "";
      });
  }

  detached(): void {
    this.discussionsService.unsubscribeFromDiscussion();
  }

  private async ensureDealDiscussion() {
    this.dealDiscussion = await this.discussionsService.getDiscussionInfo(this.dealClauseId);
  }

  // loadMoreComments() {
  //   this.comments = this.threadComments.slice(0, this.comments.length + 5);
  // }

  async dealClauseIdChanged() {
    await this.discussionsService.loadDiscussion(this.dealClauseId);
    this.threadComments = this.discussionsService.comments;
  }

  async addComment(): Promise<void> {
    this.isLoading = "commenting";
    this.threadComments = await this.discussionsService.postCommentToConvo(
      this.dealClauseId,
      this.comment,
      this.replyToOriginalMessage ? this.replyToOriginalMessage._id : null);
    this.comment = "";
    this.isLoading = "";
  }

  async replyComment(_id: string): Promise<void> {
    // console.log("replyComment");
    this.isReply = !this.isReply;
    this.replyToOriginalMessage = this.threadComments.find((comment) => comment._id === _id);
    // console.log(this.threadComments, this.replyToOriginalMessage);
  }

  async voteComment(_id: string, type: EVote): Promise<void> {
    this.isLoading = `isVoting ${_id}`;
    this.threadComments = await this.discussionsService.voteMessage(_id, type);
    this.isLoading = "";
  }

  async deleteComment(_id: string): Promise<void> {
    this.threadComments = await this.discussionsService.deleteComment(this.dealClauseId, _id);
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

  // TODO? Live update
  niceDate(date: number | string): any {
    return {
      short: (locale = "en-US") => (
        new Date(date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
      ),
      diff: () => {
        const diff = this.dateService.getDurationBetween(
          new Date(), new Date(date),
        );

        if (diff.minutes() <= 1)
          return diff.asSeconds().toFixed(0) + "sec";
        if (diff.hours() <= 1)
          return diff.asMinutes().toFixed(0) + "min";
        if (diff.days() <= 1)
          return diff.asHours().toFixed(0) + "h";
        if (diff.weeks() <= 1)
          return diff.asDays().toFixed(0) + "d";
        if (diff.months() <= 12)
          return diff.asHours().toFixed(0) + "w";

        return diff.asMonths().toFixed(0) + "y";
      },
    };
  }
}
