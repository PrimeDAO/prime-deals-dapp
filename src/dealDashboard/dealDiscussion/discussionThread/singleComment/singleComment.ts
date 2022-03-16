import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { IComment, IProfile } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import "./singleComment.scss";

interface IThreadComment extends IComment {
  createdOn: string;
  lastModified: string;
}

@autoinject
export class SingleComment {
  @bindable private comment: IThreadComment;
  @bindable private repliesTo: IThreadComment;
  @bindable private repliesToProfile: IProfile;
  @bindable private author: string;
  @bindable private profile: IProfile;
  @bindable private loading: Record<string, boolean>;
  @bindable private highlighted: number;
  @bindable private index: number;
  @bindable private isReply?: boolean = false;
  @bindable commentAction;

  private connectedAddress: string;
  private dealClauseId: string;
  private isConnected = false;
  private pressed = {
    up: false,
    down: false,
  };
  private commentTimeInterval: ReturnType<typeof setInterval>;

  constructor(
    private dateService: DateService,
    private ethereumService: EthereumService,
    private router: Router,
  ) {}

  attached(): void {
    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.dealClauseId = this.router.currentInstruction.params.discussionId;
    this.isConnected = !!this.connectedAddress;
    this.comment.lastModified = this.dateService.formattedTime(parseInt(this.comment.createdOn)).diff();
    this.commentTimeInterval = setInterval((): void => {
      this.comment.lastModified = this.dateService.formattedTime(parseInt(this.comment.createdOn)).diff();
    }, 30000);
  }

  detached() {
    clearInterval(this.commentTimeInterval);
  }

  @computedFrom("comment.upvotes", "comment.downvotes")
  private get votes(): number {
    return this.comment?.upvotes.length - this.comment?.downvotes.length;
  }

  @computedFrom("comment.upvotes", "ethereumService.defaultAccountAddress")
  private get isThumbUp(): string {
    return this.comment?.upvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbUp" : "";
  }

  @computedFrom("comment.downvotes", "ethereumService.defaultAccountAddress")
  private get isThumbDown(): string {
    return this.comment?.downvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbDown" : "";
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
    this.commentAction({
      action: "delete",
      args: {
        _id: this.comment._id,
      },
    });
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

  private lastActivity(time: number | string): string {
    const timeNumber = (typeof time === "string") ? parseInt(time) : time;
    return this.dateService.formattedTime(timeNumber).diff();
  }
}