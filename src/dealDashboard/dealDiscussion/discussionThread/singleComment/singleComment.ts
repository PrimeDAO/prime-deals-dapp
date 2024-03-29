import { IEthereumService } from "services/EthereumService";
import { IComment, IProfile } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import { ILoadingTracker, ICommentActionArgs } from "../discussionThread";
import { bindable, ISignaler } from "aurelia";
import { IRouter } from "@aurelia/router";

interface IThreadComment extends IComment {
  lastModified: string;
}

interface ICommentAction {
  action: string;
  args: ICommentActionArgs;
}

export class SingleComment {
  @bindable private comment: IThreadComment;
  @bindable private repliesTo: IThreadComment;
  @bindable private repliesToProfile: IProfile;
  @bindable private author: string;
  @bindable private profile: IProfile;
  @bindable private loading: ILoadingTracker;
  @bindable private highlighted: number;
  @bindable private index: number;
  @bindable private isReply?: boolean = false;
  @bindable private commentAction: (commentAction: ICommentAction)=>ICommentAction;
  @bindable private isAuthorized = false;
  @bindable private discussionId;

  private connectedAddress: string;
  private dealClauseId: string;
  private pressed = {
    up: false,
    down: false,
  };
  private updateTimeSignal = "update-time";
  private commentTimeInterval: ReturnType<typeof setInterval>;

  constructor(
    private dateService: DateService,
    @IEthereumService private ethereumService: IEthereumService,
    @IRouter private router: IRouter,
    @ISignaler private bindingSignaler: ISignaler,
  ) {}

  attached(): void {
    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.dealClauseId = this.discussionId;
    this.commentTimeInterval = setInterval((): void => {
      this.bindingSignaler.dispatchSignal(this.updateTimeSignal);
    }, 30000);
  }

  detaching() {
    clearInterval(this.commentTimeInterval);
  }

  private get votes(): number {
    return this.comment?.upvotes.length - this.comment?.downvotes.length;
  }

  private get isThumbUp(): string {
    return this.comment?.upvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbUp" : "";
  }

  private get isThumbDown(): string {
    return this.comment?.downvotes.includes(this.ethereumService.defaultAccountAddress) ? "isThumbDown" : "";
  }

  private get bgType(): string {
    if (this.highlighted) return "highlighted";
    return this.index % 2 === 0 ? "even" : "odd";
  }

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
    this.pressed = {
      up: vote.toLowerCase().indexOf("up")>0,
      down: vote.toLowerCase().indexOf("down")>0,
    };
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
