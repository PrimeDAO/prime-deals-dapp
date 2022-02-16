import { DealService } from "services/DealService";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { EventConfigFailure } from "services/GeneralEvents";
import { EthereumService, Networks, AllowedNetworks } from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Convo } from "@theconvospace/sdk";
import { ethers } from "ethers";
import { IDealDiscussion, IComment, VoteType, IProfile } from "entities/DealDiscussions";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDX, getLegacy3BoxProfileAsBasicProfile } from "@ceramicstudio/idx";
import CeramicClient from "@ceramicnetwork/http-client";

@autoinject
export class DiscussionsService {

  public comments: Array<IComment> = [];
  private convo = new Convo(process.env.CONVO_API_KEY);
  private convoVote = new Convo("CONVO"); // Temporary - need to be fixed by Anodit.
  private idx: IDX;

  @bindable public discussions: Record<string, IDealDiscussion> = {};
  @bindable private comment: string;

  constructor(
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService,
    private eventAggregator: EventAggregator,
    private dealService: DealService,
    private dataSourceDeals: IDataSourceDeals,
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

  public loadDealDiscussions(clauseDiscussions: Map<string, string>): void {
    for (const [, value] of clauseDiscussions.entries()) {
      this.discussions[value] = this.dataSourceDeals.get<IDealDiscussion>(value);
    }
  }

  public async createDiscussion(
    dealId: string,
    args: {
      discussionId: string,
      clauseHash: string | null,
      topic: string,
      clauseIdx: number | null,
      isPublic: boolean,
      members?: Array<string>,
      admins?: Array<string>,
    }): Promise<string> {

    const discussions = this.discussions || {};
    const createdBy = this.ethereumService.defaultAccountAddress;

    // Don't create a new discussion if it already exists
    if (this.discussions[args.discussionId]) return args.discussionId;

    const discussionId = (await args.discussionId) || (await this.hashString(`${dealId}-${args.topic}-${new Date().getTime()}`));

    if (!createdBy) {
      this.eventAggregator.publish("handleFailure", "Please first connect your wallet in order to create a discussion");
      return null;
    } else {
      discussions[discussionId] = {
        version: "0.0.1",
        discussionId: args.discussionId,
        topic: args.topic,
        clauseHash: args.clauseHash,
        clauseIdx: args.clauseIdx,
        createdByAddress: createdBy,
        createdAt: new Date(),
        modifiedAt: new Date(),
        replies: 0,
        isPrivate: !args.isPublic,
        members: [...new Set([...args.members, createdBy])] || [createdBy],
        admins: [...new Set([...args.admins, createdBy])] || [createdBy],
      };

      const dealData = await this.dealService.deals.get(dealId);
      // this.convo.threads.create(
      //   this.ethereumService.defaultAccountAddress,
      //   localStorage.getItem("discussionToken"),
      //   args.topic,
      //   "https://deals.prime.xyz/deal/${dealId}",
      //   "",
      //   !dealData.registrationData.isPrivate,
      //   !dealData.registrationData.isPrivate,
      //   [
      //     dealData.registrationData.proposalLead.address,
      //     ...(dealData.registrationData.primaryDAO?.members || []),
      //     ...(dealData.registrationData.partnerDAO?.members || []),
      //   ],
      //   [dealData.registrationData.proposalLead.address],
      //   [""],
      //   {},
      //   args.discussionId,
      // );

      await dealData.addClauseDiscussion(
        args.clauseHash,
        discussionId,
      );

      await this.dataSourceDeals.update(discussionId, JSON.stringify(this.discussions[discussionId]));
      this.dealService.deals.set(dealId, dealData);

      return discussionId;
    }
  }

  public async updateDiscussionListStatus(discussionId: string, timestamp?: Date): Promise<void> {
    this.discussions[discussionId].replies = this.comments.length;
    if (timestamp) this.discussions[discussionId].modifiedAt = timestamp;
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

  public async loadDiscussionComments(discussionId: string): Promise<IComment[]> {
    try {
      this.comments = await this.convo.comments.query({
        threadId: `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
      });

      return this.comments ? [...this.comments]: null;
    } catch (error) {
      this.consoleLogService.logMessage(error);
    }
  }

  public getNetworkId(network: AllowedNetworks): number {
    if (network === Networks.Mainnet) return 1;
    if (network === Networks.Rinkeby) return 4;
    if (network === Networks.Kovan) return 42;
  }

  public async addComment(discussionId: string, comment: string, isPrivate: boolean, replyTo: string): Promise<IComment[]> {
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

    if (!this.ethereumService.defaultAccountAddress) {
      throw new Error("Wallet is not connected. Message has not been added to the thread.");
      return;
    }

    try {
      const data = await this.convo.comments.create(
        this.ethereumService.defaultAccountAddress,
        localStorage.getItem("discussionToken"),
        comment,
        `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`,
        "https://deals.prime.xyz",
        {
          isPrivate,
        },
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
  public async loadProfile(authorWalletAddress: string): Promise<IProfile> {
    // Get the IDX profile
    try {
      const ceramic = new CeramicClient("https://gateway.ceramic.network");
      this.idx = new IDX({ ceramic });
      const profile:any = await this.idx.get("basicProfile", authorWalletAddress + "@eip155:" + this.getNetworkId(process.env.NETWORK as AllowedNetworks));
      // Currently IDX.get returns Promise<unknown>
      // Follow changes on: https://developers.idx.xyz/reference/idx/#get
      if (profile !== null) {
        return {
          address: authorWalletAddress,
          image: profile.image.original.src.replace("ipfs://", "https://ipfs.io/ipfs/"),
          name: profile.name,
        };
      }

      return {
        address: authorWalletAddress,
        image: "https://icon-library.com/images/vendetta-icon/vendetta-icon-14.jpg",
        name: "Anonymous",
      };
    } catch (error) {
      this.consoleLogService.logMessage(`No DID Profile. Fallback to 3Box. ${error.message}`, "warn");
    }

    // Retrieve profile info from (legacy) 3Box
    try {
      return await getLegacy3BoxProfileAsBasicProfile(authorWalletAddress).then(profile => {

        if (profile !== null) {
          return {
            address: authorWalletAddress,
            image: profile.image.original.src.replace("ipfs://", "https://ipfs.io/ipfs/"),
            name: profile.name,
          };
        } else {
          return {
            address: authorWalletAddress,
            image: null,
            name: null,
          };
        }
      });
    } catch (error) {
      this.consoleLogService.logMessage(`No 3Box Profile. ${ error.message }`, "error");
    }
  }

  // edit comment by id?
}
