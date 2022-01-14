// import { DiscussionsService } from "../discussionsService";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService } from "dealDashboard/discussionsService";
import "./dealThread.scss";

export interface IDiscussion {
  id: string,
  topic: string,
  creator: string,
  createdAt: Date,
  replies: number,
  lastActivity: number | null,
}

@autoinject
export class DealThread{
  @bindable dealClause: string;

  constructor(
    private router: Router,
    private discussionsService: DiscussionsService,
  ) {}

  private dealClauseId: string;

  attached(): void {
    this.dealClauseId = this.router.currentInstruction.params.childRoute;
    this.dealClause = this.discussionsService.discussions[this.dealClauseId];
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }

}
