import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { IComment, IProfile } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import "./singleComment.scss";

@autoinject
export class SingleComment {

  private connectedAddress: string;
  private dealClauseId: string;
  private isConnected = false;
  private pressed = {
    up: false,
    down: false,
  };

  @bindable public author: string;
  @bindable public comment: IComment;
  @bindable public commentAction;
  @bindable public highlighted: number;
  @bindable public index: number;
  @bindable public isReply?: boolean = false;
  @bindable public loading: Record<string, boolean>;
  @bindable public profile: IProfile;
  @bindable public repliesTo: IComment;
  @bindable public repliesToProfile: IProfile;

  constructor(
    private dateService: DateService,
    private ethereumService: EthereumService,
    private router: Router,
  ) {}

  @computedFrom("index", "highlighted")
  private get bgType(): string {
    if (this.highlighted) return "highlighted";
    return this.index % 2 === 0 ? "even" : "odd";
  }

  @computedFrom("comment.downvotes", "ethereumService.defaultAccountAddress")
  private get isThumbDown(): string {
    return this.comment?.downvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbDown" : "";
  }

  @computedFrom("comment.upvotes", "ethereumService.defaultAccountAddress")
  private get isThumbUp(): string {
    return this.comment?.upvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbUp" : "";
  }

  @computedFrom ("votes")
  private get voteDirection(): string {
    return this.votes > 0 ? "up" : this.votes < 0 ? "down": "no";
  }

  @computedFrom("comment.upvotes", "comment.downvotes")
  private get votes(): number {
    return this.comment?.upvotes.length - this.comment?.downvotes.length;
  }

  public attached(): void {
    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
    this.isConnected = !!this.connectedAddress;
  }

  private delete() {
    this.commentAction({
      action: "delete",
      args: {
        _id: this.comment._id,
      },
    });
  }

  private lastActivity(time: number | string): string {
    const timeNumber = (typeof time === "string") ? parseInt(time) : time;
    return this.dateService.formattedTime(timeNumber).diff();
  }

  private reply() {
    this.commentAction({
      action: "reply",
      args: {
        _id: this.comment._id,
      },
    });
  }

  private vote(vote: string) {
    this.pressed[vote.toLowerCase().indexOf("up")>0 ? "up" : "down"] = true;
    this.commentAction({
      action: "vote",
      args: {
        _id: this.comment._id,
        vote,
      },
    });
  }

}
