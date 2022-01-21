import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IDiscussion, IComment } from "dealDashboard/discussionsService";
import "./discussionThread.scss";

@autoinject
export class DiscussionThread {
  dealDiscussion: IDiscussion;
  dealDiscussionComments: IComment[];
  @bindable dealClauseId: string;

  private threadComments = [];
  private comment = "";
  private isLoading = true;

  constructor(
    private router: Router,
    private discussionsService: DiscussionsService,
  ) {}

  private async ensureDealDiscussion() {
    this.dealDiscussion = await this.discussionsService.getDiscussionInfo(this.dealClauseId);
  }
  attached(): void {
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
    this.ensureDealDiscussion();
    this.discussionsService.loadDiscussion(this.dealClauseId).then(
      (comments: IComment[]) => {
        this.threadComments = comments;
        this.discussionsService.subscribeToDiscussion(this.dealClauseId);
        this.isLoading = false;
      });
  }

  detached(): void {
    this.discussionsService.unsubscribeFromDiscussion();
  }

  // loadMoreComments() {
  //   this.comments = this.threadComments.slice(0, this.comments.length + 5);
  // }

  async dealClauseIdChanged() {
    await this.discussionsService.loadDiscussion(this.dealClauseId);
    this.threadComments = this.discussionsService.comments;
  }

  async addComment() {
    this.isLoading = true;
    await this.discussionsService.addComment(this.dealClauseId, this.comment);
    this.comment = "";
    this.isLoading = false;
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }

  private niceDate(date: number): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
}
