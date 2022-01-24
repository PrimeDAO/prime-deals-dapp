import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { EventConfigFailure } from "services/GeneralEvents";
import { EthereumService, AllowedNetworks, Networks} from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Convo } from "@theconvospace/sdk";
import axios from "axios";
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
  replies: number,
  lastActivity: Date,
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

export enum EVote {
  upvote,
  downvote
}

@autoinject
export class DiscussionsService {

  public comments: Array<IComment> = [];
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private convo = new Convo(process.env.CONVO_API_KEY);
  private convoURI = "https://theconvo.space/api";

  @bindable public discussions = null;
  @bindable private comment: string;

  constructor(
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService,
    private eventAggregator: EventAggregator,
  ) { }

  private getConvoEndPoint(endpoint: string): string {
    return `${this.convoURI}/${endpoint}?apikey=${process.env.CONVO_API_KEY}`;
  }

  private async isValidAuth(): Promise<boolean> {
    if (!localStorage.getItem("discussionToken")) {
      return false;
    } else {

      try {
        const validation = await (await axios.post(
          this.getConvoEndPoint("validateAuth"),
          {
            signerAddress: this.ethereumService.defaultAccountAddress,
            token: localStorage.getItem("discussionToken"),
          },
        )).data;
        return validation.success;
      } catch (error) {
        this.consoleLogService.logMessage(error.message);
        return false;
      }
      // const validation = await this.convo.auth.validate(
      //   this.ethereumService.defaultAccountAddress,
      //   localStorage.getItem("discussionToken"),
      // );
    }
  }

  private authenticateSession = async (): Promise<boolean> => {
    const timestamp = Date.now();
    const wallet = this.ethereumService.defaultAccountAddress;
    localStorage.removeItem("discussionToken");

    const signerAddress = await this.ethereumService.walletProvider.getSigner().getAddress();
    const data = `I allow this site to access my data on The Convo Space using the account ${signerAddress}. Timestamp:${timestamp}`;
    const signature = await this.ethereumService.walletProvider.send(
      "personal_sign",
      [
        ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(data),
        ),
        wallet,
      ],
    );

    const {message, success } = (await axios.post(
      this.getConvoEndPoint("auth"),
      {
        "signature": signature,
        "signerAddress": wallet,
        "timestamp": timestamp,
        "chain": "ethereum",
      },
    )).data;

    // const {message, success } = await this.convo.auth.authenticate(
    //   this.ethereumService.defaultAccountAddress,
    //   signature,
    //   timestamp,
    //   "ethereum",
    // );

    if (success) {
      localStorage.setItem("discussionToken", message);
      return true;
    }

    return false;
  };

  public getDiscussions = async (): Promise<IDiscussion> => {
    try {
      // TODO: Fetch from Data-Storage service
      const discussions = JSON.parse(localStorage.getItem("discussions"));
      if (discussions) if ( Object.keys(discussions).length) {
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

    const discussions = JSON.parse(localStorage.getItem("discussions")) || {};
    const createdBy = this.ethereumService.defaultAccountAddress;

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
      const discussions = JSON.parse(localStorage.getItem("discussions"));
      discussions[discussionId].replies = this.comments.length;
      discussions[discussionId].lastActivity = comment.timestamp;
      localStorage.setItem("discussions", JSON.stringify(discussions));
    });
  }

  public unsubscribeFromDiscussion(): void {
    this.discussionCommentsStream.unsubscribe();
  }

  public async loadDiscussion(discussionId: string): Promise<IComment[]> {
    try {
      this.comments = (await axios.get(
        this.getConvoEndPoint("comments") + `&threadId=${ discussionId }:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
      )).data;
      // this.comments = await this.convo.comments.query({
      //   threadId: `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
      //   // url,        // Origin URL
      //   // author,     // Blockchain Wallet Address
      //   // tag1,       // Custom Tag
      //   // tag2,       // Custom Tag
      //   // replyTo: "", // CommentId of the original Comment
      //   latestFirst: "false", // Return Newer on the top
      //   page: `${pageIdx}`,
      //   pageSize: "15",
      // });

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

  public async postCommentToConvo(discussionId: string, comment: string, replyTo: string): Promise<IComment[]> {
    const isValidAuth = await this.isValidAuth();

    if (!isValidAuth) {
      if (this.ethereumService.defaultAccountAddress) {
        await this.authenticateSession();
      } else {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Please connect your wallet to add a comment"),
        );
        return this.comments;
      }
    }

    try {
      const data = (await axios.post(
        this.getConvoEndPoint("comments"),
        {
          "token": localStorage.getItem("discussionToken"),
          "signerAddress": this.ethereumService.defaultAccountAddress,
          "comment": comment,
          "threadId": `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
          "url": "https://deals.prime.xyz",
          "replyTo": replyTo,
        },
      )).data;
      // const data = await this.convo.comments.create(
      //   this.ethereumService.defaultAccountAddress,
      //   localStorage.getItem("discussionToken"),
      //   comment,
      //   `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
      //   "https://deals.prime.xyz",
      //   replyTo,
      // );
      this.comments.push(data);
      return this.comments;
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  public async deleteComment(discussionId: string, commentId: string): Promise<IComment[]> {
    const isValidAuth = await this.isValidAuth();

    if (!this.ethereumService.defaultAccountAddress) {
      this.eventAggregator.publish(
        "handleValidationError",
        new EventConfigFailure("Please connect your wallet to add a comment"),
      );
      return null;
    }

    if (!isValidAuth) {
      await this.authenticateSession();
      if (!isValidAuth) {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Signature is needed to vote a comment"),
        );
      }
    }

    try {
      // await axios.delete(
      //   this.getConvoEndPoint("delete"),
      //   {
      //     headers: {
      //       "token": localStorage.getItem("discussionToken"),
      //     },
      //     data: {
      //       "commentId": commentId,
      //     },
      //   },
      // );
      await this.convo.comments.delete(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        commentId,
      );
      this.comments = this.comments.filter(comment => comment._id !== commentId);
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
    return this.comments;
  }

  public async voteMessage(_id: string, type: EVote): Promise<IComment[]> {
    const walletAddress = this.ethereumService.defaultAccountAddress;

    if (!walletAddress) {
      this.eventAggregator.publish(
        "handleValidationError",
        new EventConfigFailure("Please connect your wallet to vote a comment"),
      );
      return null;
    }

    if (!await this.isValidAuth()) {
      await this.authenticateSession();
      if (!await this.isValidAuth()) {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Signature is needed to vote a comment"),
        );
        return this.comments;
      }
    }

    // const url = this.getConvoEndPoint("vote");
    const url = "https://theconvo.space/api/vote?apikey=CONVO"; // Temporary, until the API bug is fixed
    const token = localStorage.getItem("discussionToken");

    try {
      const message = await (await axios.get(this.getConvoEndPoint("comment") + `&commentId=${_id}`)).data;
      const types = ["toggleUpvote", "toggleDownvote"];
      const endpoints = {toggleUpvote: "upvotes", toggleDownvote: "downvotes"};
      const typeInverse = types[types.length - types.indexOf(type.toString()) - 1];

      /**
       * If a voter up-vote after already down-voted, we need to remove
       * the voter address from the list of down-votes (and vice versa)
       */
      if (message[endpoints[typeInverse]].includes(walletAddress)) {
        await axios.post(url, {
          "token": token,
          "signerAddress": walletAddress,
          "commentId": message._id,
          "type": typeInverse,
        });
      }

      const res = await axios.post(url, {
        "token": token,
        "signerAddress": walletAddress,
        "commentId": message._id,
        "type": type,
      });
      if (res.data.success) {
        const message = await (await axios.get(this.getConvoEndPoint("comment") + `&commentId=${_id}`)).data;
        const commentId = this.comments.findIndex(comment => comment._id === message._id);
        this.comments[commentId] = message;
        return [...this.comments];
      }

    } catch (error) {
      throw error.message;
    }
  }
  // get user profile
  // get threads list by deal id
  // edit comment by id?
  // delete comment by id?
}
