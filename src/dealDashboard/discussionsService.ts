import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { EventConfigFailure } from "services/GeneralEvents";
import { EthereumService, AllowedNetworks, Networks} from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Convo } from "@theconvospace/sdk";
import { ethers } from "ethers";
import { Realtime } from "ably/promises";
import { Types } from "ably";

export interface IDiscussion {
  createdBy: string,
  createdOn: Date,
  admins: Array<string>,
  members: Array<string>,
  isPublic: boolean,
  clauseId: number | null,
  topic: string,
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

  public comments: Array<IComment> = [];
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private convo = new Convo(process.env.CONVO_API_KEY);

  @bindable public discussions = null;
  @bindable private comment: string;

  constructor(
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService,
    private eventAggregator: EventAggregator,
  ) { }

  private async isValidAuth(): Promise<boolean> {
    if (!localStorage.getItem("discussionToken")) {
      return false;
    } else {
      const validation = await this.convo.auth.validate(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
      );
      return validation.success;
    }
  }

  private authenticateSession = async (): Promise<void> => {
    const timestamp = Date.now();
    const data = this.convo.auth.getSignatureData(this.ethereumService.defaultAccountAddress, timestamp);
    const signature = await this.ethereumService.walletProvider.send(
      "personal_sign",
      [
        ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(data),
        ),
        this.ethereumService.defaultAccountAddress.toLowerCase(),
      ],
    );

    const {message, success } = await this.convo.auth.authenticate(
      this.ethereumService.defaultAccountAddress,
      signature,
      timestamp,
      "ethereum",
    );
    if (success) {
      localStorage.setItem("discussionToken", message);
    }
  };

  public getDiscussions = async (): Promise<IDiscussion> => {
    try {
      const discussions = JSON.parse(localStorage.getItem("discussions"));
      if (discussions) if ( Object.keys(discussions).length) {

        // await discussions.forEach(async (discussionId) => {
        //   this.convo.threads.query({
        //     "threadId": discussionId,
        //   }).then(thread => {
        //     if (!this.discussions) {
        //       this.discussions[discussionId] = thread;
        //     }
        //     console.log({discussionId, discussions: this.discussions});
        //   });
        // });
        return discussions;
      }
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  };

  // Hashing using SHA-1 for shorter output length
  private hashString(string) {
    const utf8 = new TextEncoder().encode(string);
    return crypto.subtle.digest("SHA-1", utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    });
  }

  public async createDiscussion(args: {
    topic: string,
    clauseId: number | null,
    isPublic: boolean,
    members?: Array<string>,
    admins?: Array<string>,
  }): Promise<string> {
    const discussionId = await this.hashString(args.topic);
    console.log({discussionId});

    const discussions = JSON.parse(localStorage.getItem("discussions")) || {};
    const createdBy = this.ethereumService.defaultAccountAddress;
    console.log({createdBy});

    if (!createdBy) {
      this.eventAggregator.publish("handleFailure", "Please first connect your wallet in order to create a discussion");
      return null;
    } else {
      discussions[discussionId] = {
        ...args,
        createdBy,
        createdOn: new Date(),
      };
      localStorage.setItem("discussions", JSON.stringify(discussions));

      return discussionId;
    }
  }

  public async getDiscussionInfo(discussionId: string): Promise<IDiscussion> {
    this.subscribeToDiscussion(discussionId);
    return JSON.parse(localStorage.getItem("discussions"))[discussionId];
  }

  public async subscribeToDiscussion(discussionId: string): Promise<void> {
    const channelName = `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`;
    const ably = new Realtime.Promise({ authUrl: `https://theconvo.space/api/getAblyAuth?apikey=${ process.env.CONVO_API_KEY }` });

    this.discussionCommentsStream = await ably.channels.get(channelName);

    this.discussionCommentsStream.subscribe((comment: Types.Message) => {
      /**
       * If a new comment is added to the thread, it is added at the
       * end of the comments array.
       * */
      if (!this.comments.some(item => item._id === comment.data._id)) {
        this.comments.push(comment.data);
      }
    });
  }

  public unsubscribeFromDiscussion(): void {
    this.discussionCommentsStream.unsubscribe();
  }

  public async loadDiscussion(discussionId: string, pageIdx = 0): Promise<IComment[]> {
    try {
      this.comments = await this.convo.comments.query({
        threadId: `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
        // url,        // Origin URL
        // author,     // Blockchain Wallet Address
        // tag1,       // Custom Tag
        // tag2,       // Custom Tag
        // replyTo: "", // CommentId of the original Comment
        latestFirst: "false", // Return Newer on the top
        page: `${pageIdx}`,
        pageSize: "15",
      });

      console.log(this.comments);

      return [...this.comments];
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  private getNetworkId(network: AllowedNetworks): number {
    if (network === Networks.Mainnet) return 1;
    if (network === Networks.Rinkeby) return 4;
    if (network === Networks.Kovan) return 42;
  }

  public async addComment(discussionId: string, comment: string): Promise<IComment> {
    const isValidAuth = await this.isValidAuth();

    if (!isValidAuth) {
      if (this.ethereumService.defaultAccountAddress) {
        await this.authenticateSession();
      } else {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Please connect your wallet to add a comment"),
        );
        return;
      }
    }

    try {
      const data = await this.convo.comments.create(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        comment,
        `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
        "https://deals.prime.xyz",
      );
      this.comments.push(data);
      return data as IComment;
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  public async deleteComment(discussionId: string, commentId: string): Promise<void> {
    console.log("DELETE COMMENT");
    const isValidAuth = await this.isValidAuth();

    if (!isValidAuth) {
      if (this.ethereumService.defaultAccountAddress) {
        await this.authenticateSession();
      } else {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Please connect your wallet to add a comment"),
        );
        return;
      }
    }

    try {
      await this.convo.comments.delete(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        commentId,
      );
      this.comments = this.comments.filter(comment => comment._id !== commentId);
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  // get user profile
  // get threads list by deal id
  // edit comment by id?
  // delete comment by id?
}
