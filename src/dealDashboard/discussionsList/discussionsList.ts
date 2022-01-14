import { DiscussionsService } from "../discussionsService";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DateService } from "services/DateService";
import "./discussionsList.scss";

export interface IDiscussion {
  topic: string,
  creator: string,
  createdAt: Date,
  replies: number,
  lastActivity: number | null,
}

@autoinject
export class DiscussionsList{

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussions: Array<IDiscussion> = [];
  private hasDiscussions: boolean;

  constructor(
    private dateService: DateService,
    private router: Router,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.discussionsService.init();
    this.discussions = Object.keys(this.discussionsService.discussions).map(key => (
      {id: key, ...this.discussionsService.discussions[key]}
    ));

    this.hasDiscussions = !!this.discussions.length;
  }

  private niceDate(date: number): string {
    const dateObj = new Date(date);

    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
