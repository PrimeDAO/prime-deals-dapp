import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { DiscussionsService, IComment } from "dealDashboard/discussionsService";
import { DateService } from "services/DateService";
import "./singleComment.scss";

@autoinject
export class SingleComment {
  @bindable private comment: IComment;
  @bindable private author: string;
  @bindable private loading: string;
  @bindable callback;

  private isConnected = false;
  private dealClauseId: string;
  private connectedAddress: string;
  // private votes: number;

  constructor(
    private discussionsService: DiscussionsService,
    private dateService: DateService,
    private ethereumService: EthereumService,
    private router: Router,
  ) {}

  attached(): void {
    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
    this.isConnected = !!this.connectedAddress;

  }

  @computedFrom("comment.upvotes", "comment.downvotes")
  private get votes(): number {
    return this.comment.upvotes.length - this.comment.downvotes.length;
  }

  @computedFrom ("votes")
  private get voteDirection(): string {
    return this.votes > 0 ? "up" : this.votes < 0 ? "down": "no";
  }

  delete() {
    this.callback({
      action: "delete",
      args: {
        _id: this.comment._id,
      },
    });
  }

  reply() {
    this.callback({
      action: "reply",
      args: {
        _id: this.comment._id,
      },
    });
  }

  vote(vote: string) {
    this.callback({
      action: "vote",
      args: {
        _id: this.comment._id,
        vote,
      },
    });
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
