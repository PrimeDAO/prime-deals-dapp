import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IDiscussion } from "dealDashboard/discussionsService";
import "./dealThread.scss";

@autoinject
export class DealThread {
  dealClause: IDiscussion;
  @bindable private dealClauseId: string;

  constructor(
    private router: Router,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.dealClauseId = this.router.currentInstruction.params.threadId;
    this.dealClause = this.discussionsService.discussions[this.dealClauseId];
  }

  dealClauseIdChanged(newValue, oldValue) {
    this.dealClause = this.discussionsService.discussions[this.dealClauseId];
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }

  private niceDate(date: number): string {
    const dateObj = new Date(date);

    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
}
