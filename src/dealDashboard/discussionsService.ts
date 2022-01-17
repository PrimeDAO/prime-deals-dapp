import { EthereumService } from "services/EthereumService";
import { autoinject, bindable } from "aurelia-framework";
import { ethers } from "ethers";
import { ConsoleLogService } from "services/ConsoleLogService";
// import { Realtime } from "ably/promises";

export interface IDiscussion {
  id: string,
  idx: number,
  topic: string,
  creator: string,
  createdAt: Date,
  replies: number,
  lastActivity: number | null,
}

export interface IComment {
  _id: string,
  text: string,
  author: string,
  metadata: any,
  replyTo?: string,
  upvotes: Array<string>,
  downvotes: Array<string>,
  timestamp: number,
}

export interface IProfile {
  address: string,
  image: string,
  name: string,
}

@autoinject
export class DiscussionsService {

  private comments: Array<IComment> = [];
  private showReply = "";
  private channelName: string;
  private channel: any;

  @bindable private comment: string;
  @bindable private inputRef: HTMLTextAreaElement;
  @bindable private dealId: string;

  constructor(
    // private realtime: Realtime,
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService,
  ) {
    this.init();
  }

  @bindable public discussions = null;
  // TODO: discuss service

  public init(): void {
    // auth init
    // this.channelName = `deal-${this.dealId}`; /* Hash it? */
    // const ably = new Realtime.Promise({authUrl: `https://theconvo.space/api/getAblyAuth?apikey=${ process.env.CONVO_API_KEY}}`});

    // this.channel = await ably.channels.get(this.channelName);

    // const signer = this.ethereumService.getDefaultSigner();
    this.getDiscussions();
  }

  private getDiscussions = async (): Promise<IDiscussion> => {
    try {
      if (localStorage.length) {
        this.discussions = JSON.parse(localStorage.getItem("discussions") || "{}");
        if (Object.keys(this.discussions).length === 0) {
          localStorage.setItem("discussions", JSON.stringify(this.discussions));
        }
        return this.discussions;
      }
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  };

  public async createDiscussion(topic: string, idx: number): Promise<string> {
    this.getDiscussions();

    const discussionId = ethers.utils.hashMessage(topic);
    const newDiscussion: IDiscussion = {
      id: discussionId,
      idx,
      topic: topic,
      creator: this.ethereumService.defaultAccountAddress,
      createdAt: new Date(),
      replies: 0,
      lastActivity: null,
    };

    if (!this.discussions[discussionId]) {
      this.discussions[discussionId] = newDiscussion;
    }
    localStorage.setItem("discussions", JSON.stringify(this.discussions));
    return discussionId;
  }

  // What is the current user address?
  // What is the current provider?

  // authenticate wallet (before creating a comment)

  // get user profile

  // get threads list by deal id

  // get all comments by thread id

  // send comment to thread

  // delete comment by id?

  // create new thread for deal id
}
