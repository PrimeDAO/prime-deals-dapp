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

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
