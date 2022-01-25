import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IDiscussion } from "../discussionsService";
import { DateService } from "services/DateService";
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
    private dateService: DateService,
    private discussionsService: DiscussionsService,
  ) {}

  attached(): void {
    this.dealId = this.router.parent.currentInstruction.params.address;
    this.discussionsService.getDiscussions().then(discussions => {
      this.discussions = Object.keys(discussions).map(key => (
        {id: key, ...discussions[key]}
      ));

      this.hasDiscussions = !!this.discussions.length;
    });
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
