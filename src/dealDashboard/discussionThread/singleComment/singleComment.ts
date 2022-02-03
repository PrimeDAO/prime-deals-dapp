import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { IComment } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import "./singleComment.scss";

@autoinject
export class SingleComment {
  @bindable private comment: IComment;
  @bindable private repliesTo: IComment;
  @bindable private author: string;
  @bindable private loading: string;
  @bindable private highlighted: number;
  @bindable private index: number;
  @bindable callback;

  private connectedAddress: string;
  private dealClauseId: string;
  private isConnected = false;

  constructor(
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

  @computedFrom("index", "highlighted")
  private get bgType(): string {
    if (this.highlighted) return "highlighted";
    return this.index % 2 === 0 ? "even" : "odd";
  }

  @computedFrom ("votes")
  private get voteDirection(): string {
    return this.votes > 0 ? "up" : this.votes < 0 ? "down": "no";
  }

  private delete() {
    this.callback({
      action: "delete",
      args: {
        _id: this.comment._id,
      },
    });
  }

  private reply() {
    this.callback({
      action: "reply",
      args: {
        _id: this.comment._id,
      },
    });
  }

  private vote(vote: string) {
    this.callback({
      action: "vote",
      args: {
        _id: this.comment._id,
        vote,
      },
    });
  }
}
