import { DiscussionsService, IDiscussion } from "../discussionsService";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./discussionsList.scss";

@autoinject
export class DiscussionsList{

  dealId: string;

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussions: Array<IDiscussion> = [];
  private hasDiscussions: boolean;

  constructor(
    private router: Router,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.dealId = this.router.parent.currentInstruction.params.address;
    console.log("DiscussionsList attached", this.dealId);
    this.discussionsService.getDiscussions().then(discussions => {
      console.log("DiscussionsList attached", discussions);

      this.discussions = Object.keys(discussions).map(key => (
        {id: key, ...discussions[key]}
      ));

      this.hasDiscussions = !!this.discussions.length;
    });
  }

  private niceDate(date: number): string {
    const dateObj = new Date(date);

    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
