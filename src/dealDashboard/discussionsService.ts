import { DealService } from "services/DealService";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { EventConfigFailure } from "services/GeneralEvents";
import { EthereumService, AllowedNetworks, Networks} from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Convo } from "@theconvospace/sdk";
import { ethers } from "ethers";
import { Realtime } from "ably/promises";
import { Types } from "ably";
import { DealDiscussions, IComment, VoteType } from "entities/DealDiscussions";

@autoinject
export class DiscussionsService {

  public comments: Array<IComment> = [];
  private discussionCommentsStream: Types.RealtimeChannelPromise;
  private convo = new Convo(process.env.CONVO_API_KEY);
  private convoVote = new Convo("CONVO"); // Temporary - need to be fixed by Anodit.

  @bindable public discussions = null;
  @bindable private comment: string;

  constructor(
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService,
    private eventAggregator: EventAggregator,
    private dealDiscussion: DealDiscussions,
    private dealService: DealService,
  ) { }

  @computedFrom("ethereumService.defaultAccountAddress")
  private get currentWalletAddress(): string {
    return this.ethereumService.defaultAccountAddress;
  }

  private async isValidAuth(): Promise<boolean> {
    if (!localStorage.getItem("discussionToken")) {
      return false;
    } else {

      try {
        const validation = await this.convo.auth.validate(
          this.ethereumService.defaultAccountAddress,
          localStorage.getItem("discussionToken"),
        );
        return validation.success;
      } catch (error) {
        this.consoleLogService.logMessage(error.message);
        return false;
      }
    }
  }

  private authenticateSession = async (): Promise<boolean> => {
    const timestamp = Date.now();
    localStorage.removeItem("discussionToken");

    if (!this.ethereumService.walletProvider) return false;

    const signerAddress = await this.ethereumService.walletProvider.getSigner().getAddress();
    const data = `I allow this site to access my data on The Convo Space using the account ${signerAddress}. Timestamp:${timestamp}`;
    const signature = await this.ethereumService.walletProvider.send(
      "personal_sign",
      [
        ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(data),
        ),
        this.currentWalletAddress,
      ],
    );

    const {message, success } = await this.convo.auth.authenticate(
      this.currentWalletAddress,
      signature,
      timestamp,
      "ethereum",
    );

    if (success) {
      localStorage.setItem("discussionToken", message);
      return true;
    }

    return false;
  };

  // Hashing using SHA-1 for shorter output length
  public async hashString(string): Promise<string> {
    const utf8 = new TextEncoder().encode(string);
    const digest = await crypto.subtle.digest("SHA-1", utf8);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashString = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return hashString;
  }

  public async createDiscussion(
    dealId: string,
    args: {
      topic: string,
      clauseId: number | null,
      isPublic: boolean,
      members?: Array<string>,
      admins?: Array<string>,
    }): Promise<string> {
    const discussionId = await this.hashString(args.topic);

    const discussions = this.dealDiscussion.items || {};
    const createdBy = this.ethereumService.defaultAccountAddress;

    // Don't create a new discussion if it already exists
    if (discussions[discussionId]) return discussionId;

    if (!createdBy) {
      this.eventAggregator.publish("handleFailure", "Please first connect your wallet in order to create a discussion");
      return null;
    } else {
      discussions[discussionId] = {
        version: "0.0.1",
        discussionId,
        topic: args.topic,
        clauseId: args.clauseId,
        createdByAddress: createdBy,
        createdAt: new Date(),
        modifiedAt: new Date(),
        replies: 0,
        isPrivate: !args.isPublic,
        members: [...new Set([...args.members, createdBy])] || [createdBy],
        admins: [...new Set([...args.admins, createdBy])] || [createdBy],
      };

      const dealData = await this.dealService.deals.get(dealId);
      dealData.discussions.push(discussionId);
      this.dealService.deals.set(dealId, dealData);
      // TODO: Save discussion object using ceramicService

      return discussionId;
    }
  }

  public updateDiscussionListStatus(discussionId: string, timestamp?: Date): void {
    const discussions = this.dealDiscussion.items || {};
    discussions[discussionId].replies = this.comments.length;
    if (timestamp) discussions[discussionId].modifiedAt = timestamp;
  }

  // public async toggleThreadPrivacy(threadId: string): Promise<void> {
  //   const token = localStorage.getItem("discussionToken");

  //   if (!token || !await this.isValidAuth()) await this.authenticateSession();
  //   if (!token || !await this.isValidAuth()) return;

  //   const thread = await this.convo.threads.createPrivate(
  //     this.currentWalletAddress,
  //     token,
  //     "title",
  //     "description",
  //     "https://deals.prime.xyz",
  //     [this.currentWalletAddress],
  //     [this.currentWalletAddress],
  //     [""],
  //     {},
  //     threadId,
  //   );

  //   // await this.convo.threads.togglePublicRead(
  //   //   this.currentWalletAddress,
  //   //   token,
  //   //   threadId,
  //   // );
  //   // const thread = await this.convo.threads.getThreads([threadId]);
  //   console.log({thread});
  // }

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
      this.updateDiscussionListStatus(discussionId, new Date(comment.timestamp));
    });
  }

  public unsubscribeFromDiscussion(): void {
    if (this.discussionCommentsStream) {
      this.discussionCommentsStream.unsubscribe();
    }
  }

  public async loadDiscussionComments(discussionId: string, pageIdx = 0): Promise<IComment[]> {
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
        // pageSize: "15",
      });

      return this.comments ? [...this.comments]: null;
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  private getNetworkId(network: AllowedNetworks): number {
    if (network === Networks.Mainnet) return 1;
    if (network === Networks.Rinkeby) return 4;
    if (network === Networks.Kovan) return 42;
  }

  public async addComment(discussionId: string, comment: string, replyTo: string): Promise<IComment[]> {
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
      const data = await this.convo.comments.create(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        comment,
        `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
        "https://deals.prime.xyz",
        {},
        // @ts-ignore: Unreachable code error
        replyTo,
      );
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
      await this.convo.comments.delete(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        commentId,
      );
      this.comments = this.comments.filter(comment => comment._id !== commentId);
      this.updateDiscussionListStatus(discussionId, new Date());
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
    return this.comments;
  }

  public async voteComment(discussionId: string, commentId: string, type: VoteType): Promise<IComment[]> {

    if (!this.currentWalletAddress) {
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

    const token = localStorage.getItem("discussionToken");

    try {
      const message = await this.convoVote.comments.getComment(commentId);
      const types = ["toggleUpvote", "toggleDownvote"];
      const endpoints = {toggleUpvote: "upvotes", toggleDownvote: "downvotes"};
      const typeInverse = types[types.length - types.indexOf(type.toString()) - 1];

      /**
       * If a voter up-vote after already down-voted, we need to remove
       * the voter address from the list of down-votes (and vice versa)
       */
      if (message[endpoints[typeInverse]].includes(this.currentWalletAddress)) {
        await this.convoVote.comments[typeInverse](this.currentWalletAddress, token, commentId);
      }

      const success = (await this.convoVote.comments[type](this.currentWalletAddress, token, commentId)).success;

      // Toggle vote locally
      if (!message[endpoints[type]].includes(this.currentWalletAddress)) {
        message[endpoints[type]].push(this.currentWalletAddress);
        message[endpoints[typeInverse]] = message[endpoints[typeInverse]].filter(address => address !== this.currentWalletAddress);
      } else {
        message[endpoints[type]] = message[endpoints[type]].filter(address => address !== this.currentWalletAddress);
      }

      if (success) {
        const commentIndex = this.comments.findIndex(comment => comment._id === message._id);
        this.comments[commentIndex] = message;
        this.updateDiscussionListStatus(discussionId, new Date());
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
