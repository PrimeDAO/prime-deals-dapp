import { EthereumService } from "services/EthereumService";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IComment } from "dealDashboard/discussionsService";
import { DateService } from "services/dateService";
import "./singleComment.scss";

@autoinject
export class SingleComment {
  @bindable private comment: IComment;
  private dealClauseId: string;
  private connectedAddress: string;

  constructor(
    private discussionsService: DiscussionsService,
    private dateService: DateService,
    private ethereumService: EthereumService,
    private router: Router,
  ) {}

  attached(): void {
    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
  }

  private deleteComment(): void {
    console.log(this.dealClauseId, this.comment._id);

    this.discussionsService.deleteComment(this.dealClauseId, this.comment._id);
  }

  // TODO? Live update
  niceDate(date: number): any {
    return {
      short: (locale = "en-US") => (
        new Date(date / 1).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
      ),
      diff: () => {
        const diff = this.dateService.getDurationBetween(
          new Date(), new Date(date / 1),
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
