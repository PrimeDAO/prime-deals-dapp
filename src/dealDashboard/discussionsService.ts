import { EthereumService, IEthereumService } from "./../services/EthereumService";
import { BrowserStorageService } from "services/BrowserStorageService";
import { DealService } from "services/DealService";
import { EventConfigFailure } from "services/GeneralEvents";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Convo } from "@theconvospace/sdk";
import { ethers } from "ethers";
import { IDealDiscussion, IComment, IProfile } from "entities/DealDiscussions";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { DateService } from "services/DateService";
import { IDeal } from "entities/IDealTypes";
import { COMMENTS_STREAM_UPDATED, DiscussionsStreamService, Types } from "./discussionsStreamService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IEventAggregator, inject } from "aurelia";

interface IDiscussionListItem extends IDealDiscussion {
  modifiedAt: string
}

export const deletedByAuthorErrorMessage = "This comment has been deleted by the author";

@inject()
export class DiscussionsService {

  private convo = new Convo(process.env.CONVO_API_KEY, process.env.CONVO_API_NODE);

  public discussions: Record<string, IDiscussionListItem> = {};
  private comment: string;
  private ensName: string;

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    private consoleLogService: ConsoleLogService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dealService: DealService,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    private dateService: DateService,
    private discussionsStreamService: DiscussionsStreamService,
    private browserStorageService: BrowserStorageService,
  ) { }

  private get currentWalletAddress(): string {
    return this.ethereumService.defaultAccountAddress;
  }

  private async isValidAuth(): Promise<boolean> {
    if (!this.browserStorageService.lsGet("discussionToken")) {
      return false;
    } else {

      try {
        const validation = await this.convo.auth.validate(
          this.ethereumService.defaultAccountAddress,
          this.browserStorageService.lsGet("discussionToken"),
        );
        return validation.success;
      } catch (error) {
        this.consoleLogService.logMessage("isValidAuth: " + error.message);
        return false;
      }
    }
  }

  private authenticateSession = async (): Promise<boolean> => {
    const timestamp = Date.now();
    this.browserStorageService.lsRemove("discussionToken");

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
    if (!signature) return false;

    const {message, success } = await this.convo.auth.authenticate(
      this.currentWalletAddress,
      signature,
      timestamp,
      "ethereum",
    );

    if (success) {
      this.browserStorageService.lsSet("discussionToken", message);
      return true;
    }

    return false;
  };

  /**
   * Hash a string using SHA-1 for constant length output
   * Used for generating a unique ID for a discussion
   *
   * @param string String to convert to hash
   * @returns hash string
   */
  public async hashString(string): Promise<string> {
    const utf8 = new TextEncoder().encode(string);
    const digest = await crypto.subtle.digest("SHA-1", utf8);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashString = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return hashString;
  }

  /**
   * Sets a discussions object from the deal data.
   * Reads the discussions ID's from the clause-discussions mapping of a deal and stores the discussion meta data for each discussion as key/value pairs to the service `discussions` object.
   * @param clauseDiscussions A map of clause discussions
   * @returns void
   */
  public loadDealDiscussions(clauseDiscussions: Record<string, IDealDiscussion>): void {
    this.discussions = clauseDiscussions;
  }

  public async setEnsName(address: string): Promise<void> {
    this.ensName = await this.ethereumService.getEnsForAddress(address);
  }

  /**
   * Creates a new discussion (if not already exists) stores it in the data storage and updates the discussion object.
   * If the discussion already exists, it returns the existing discussion ID.
   * @param dealId string
   * @param args discussion metadata object
   * @returns Promise<string> discussionId
   */
  public async createDiscussion(
    deal: IDeal,
    args: {
      discussionId: string | null,
      topic: string,
      isPublic: boolean,
    }): Promise<string> {

    const createdBy = {
      address: this.ethereumService.defaultAccountAddress,
      name: null,
    };
    if (!this.ensName) {
      await this.setEnsName(createdBy.address);
    }
    createdBy.name = this.ensName;

    if (!createdBy) {
      this.eventAggregator.publish("handleFailure", "Please first connect your wallet in order to create a discussion");
      return null;
    } else {

      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"],
      );

      const discussion: IDealDiscussion = {
        version: "0.0.1",
        createdBy,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        replies: 0,
        publicReplies: 0,
        key: (await window.crypto.subtle.exportKey("jwk", key)).k,
      };

      await deal.addClauseDiscussion(
        args.discussionId,
        discussion,
      );
      this.discussions[args.discussionId] = discussion;

      return args.discussionId;
    }
  }

  private convertArrayBufferToString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  private convertStringToArrayBuffer(text: string): ArrayBuffer {
    const buf = new ArrayBuffer(text.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = text.length; i < strLen; i++) {
      bufView[i] = text.charCodeAt(i);
    }
    return buf;
  }

  public async importKey(discussionId: string): Promise<CryptoKey> {
    if (!this.discussions[discussionId]) {
      throw new Error(`This should not have happened. Cannot find encryption key for discussion with id: ${discussionId}. (There are currenltly ${Object.keys(this.discussions).length} discussions)`);
    }

    return window.crypto.subtle.importKey(
      "jwk",
      {
        kty: "oct",
        k: this.discussions[discussionId].key,
        alg: "A256GCM",
        ext: true,
      },
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  }

  private async encryptWithAES (text: string, discussionId: string): Promise<{cipherText: any, iv: any}> {
    const key = await this.importKey(discussionId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ab = new Uint8Array(text.length);
    const enc = new TextEncoder();
    enc.encodeInto(text, ab);

    const cipherText = this.convertArrayBufferToString(await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ab,
    ));

    return {cipherText: cipherText.toString(), iv};
  }

  public async decryptWithAES (cipherText: string, ivString: string, key: CryptoKey): Promise<string> {
    const data = this.convertStringToArrayBuffer(cipherText);

    try {

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: this.convertStringToArrayBuffer(ivString),
        },
        key,
        data,
      );
      return this.convertArrayBufferToString(decrypted);

    } catch (error) {

      this.consoleLogService.logMessage("decryptWithAES: " + error.message);
      return "";

    }
  }

  public async getSingleComment(_id: string): Promise<IComment> {
    return await this.convo.comments.getComment(_id);
  }

  public async loadDiscussionComments(discussionId: string, deal: DealTokenSwap): Promise<IComment[]> {
    let latestTimestamp = 0;
    try {
      const commentsResponse: Array<IComment> = (await this.convo.comments.query({
        threadId: `${discussionId}:${EthereumService.targetedChainId}`,
      }));

      // Is typed as Array<IComment>, but the convoSdk also throws AbortController errors, so we catch it here
      if ((commentsResponse as any).error) throw (commentsResponse as any).error;

      const comments = commentsResponse.filter((comment: IComment) => !(
        (comment.metadata.isPrivate === "true") &&
          (!this.ethereumService.defaultAccountAddress ||
          ![
            comment.author,
            ...deal.memberAddresses,
          ].includes(this.ethereumService.defaultAccountAddress))
      ));

      if (!comments || comments.length === undefined) return null;

      const key = await this.importKey(discussionId);

      const promises = comments.map(async (comment: any) => {
        if (comment._mod > latestTimestamp) latestTimestamp = comment._mod;

        const text = (comment.metadata?.encrypted)
          ? await this.decryptWithAES(comment.metadata.encrypted, comment.metadata.iv, key)
          : comment.text;

        return {
          ...comment,
          text: text,
          createdOn: (comment._mod / 1000000).toString(),
        };
      });

      const commentsThread: IComment[] = await Promise.all(promises);

      latestTimestamp = latestTimestamp ? (latestTimestamp / 1000000) : new Date().getTime();

      return [...await commentsThread];
    } catch (error) {
      this.consoleLogService.logMessage("loadDiscussionComments: " + error.message, "error");
      throw error;
    }
  }

  /**
  * Add a new comment to thread. Must validate the connection to a wallet before.
  * @param discussionId string - The ID of the discussion to create the comment in
  * @param comment string - The comment to create
  * @param isPrivate boolean - Mark comment as private, if the thread is currently private
  * @param replyTo string - The ID of the comment to reply to (empty if not a reply)
  * @returns void
  */
  public async addComment(discussionId: string, comment: string, isPrivate = false, replyTo: string): Promise<IComment> {
    const isValidAuth = await this.isValidAuth();

    if (!isValidAuth) {
      if (this.ethereumService.defaultAccountAddress) {
        await this.authenticateSession();
      } else {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Please connect your wallet to add a comment"),
        );
        return null;
      }
    }

    if (!this.ethereumService.defaultAccountAddress) {
      throw new Error("Wallet is not connected. Message has not been added to the thread.");
    }

    try {
      const encrypted = await this.encryptWithAES(comment, discussionId);
      const createResponse: IComment = await this.convo.comments.create(
        this.ethereumService.defaultAccountAddress,
        this.browserStorageService.lsGet("discussionToken"),
        "This comment is encrypted",
        `${discussionId}:${EthereumService.targetedChainId}`,
        "https://deals.prime.xyz",
        {
          isPrivate: isPrivate.toString(),
          encrypted: encrypted.cipherText,
          iv: this.convertArrayBufferToString(encrypted.iv),
        },
        replyTo,
      );

      // Is typed as IComment, but the convoSdk also throws AbortController errors, so we catch it here
      if ((createResponse as any).error) throw (createResponse as any).error;

      // Return un-encrypted comment to the view
      createResponse.text = comment;
      return createResponse;
    } catch (error) {
      this.consoleLogService.logMessage("addComment: " + error.message);
      throw error;
    }
  }

  private async isCommentPresent(commentId: string): Promise<boolean> {
    const comment = await this.getSingleComment(commentId);
    return !!comment._id;
  }

  public async deleteComment(discussionId: string, commentId: string): Promise<boolean> {
    const isValidAuth = await this.isValidAuth();

    try {
      if (!this.ethereumService.defaultAccountAddress) {
        throw new Error("Please connect your wallet to add a comment.");
      }
      if (!isValidAuth) {
        await this.authenticateSession();
        if (!this.browserStorageService.lsGet("discussionToken")) {
          throw new Error("Not able to get signer token from the local storage.");
        }
      }

      const deleteResponse = await this.convo.comments.delete(
        this.ethereumService.defaultAccountAddress,
        this.browserStorageService.lsGet("discussionToken"),
        commentId,
      );

      if (deleteResponse.error) {
        /**
         * Handle theconvo issue, where the request gets aborted too quickly,
         * but the deletion actually went through.
         * The workaround is to try fetch the comment to be able to give a more confident response
         * for whether the comment was indeed deleted.
         */
        if (await this.isCommentPresent(commentId)) {
          throw deleteResponse.error;
        }
      } else if (!deleteResponse.success) {
        throw new Error("Comment not deleted");
      }

      this.eventAggregator.publish("handleInfo", "Comment deleted.");
      return true;
    } catch (error) {
      this.consoleLogService.logMessage("deleteComment: " + error.message);
      if (error.code === 4001) {
        throw new Error("Signature is needed to delete a comment.");
      }
      throw error;
    }
  }

  public async voteComment(discussionId: string, commentId: string, type: string): Promise<any> {

    if (!this.currentWalletAddress) {
      this.eventAggregator.publish(
        "handleValidationError",
        new EventConfigFailure("Please connect your wallet to vote a comment"),
      );
      return false;
    }

    if (!await this.isValidAuth()) {
      await this.authenticateSession();
      if (!(await this.isValidAuth())) {
        this.eventAggregator.publish(
          "handleValidationError",
          new EventConfigFailure("Signature is needed to vote a comment"),
        );
        return false;
      }
    }
    const token = this.browserStorageService.lsGet("discussionToken");

    try {
      const message = await this.convo.comments.getComment(commentId);
      if (!message._id) {
        const error = {success: false, code: 404, error: deletedByAuthorErrorMessage};
        return Promise.reject(error);
      }

      const types = ["toggleUpvote", "toggleDownvote"];
      const endpoints = {toggleUpvote: "upvotes", toggleDownvote: "downvotes"};
      const typeInverse = types[types.length - types.indexOf(type.toString()) - 1];

      /**
       * If a voter up-vote after already down-voted, we need to remove
       * the voter address from the list of down-votes (and vice versa)
       */
      if (message[endpoints[typeInverse]].includes(this.currentWalletAddress)) {
        const inverseVoteResponse = await this.convo.comments[typeInverse](this.currentWalletAddress, token, commentId);
        if (inverseVoteResponse.error) throw inverseVoteResponse.error;
      }

      const actualVoteResponse = (await this.convo.comments[type](this.currentWalletAddress, token, commentId));
      if (actualVoteResponse.error) {
        throw actualVoteResponse.error;
      }

      return actualVoteResponse.success;
    } catch (error) {
      if (error.message) {
        throw error.message;
      }
      throw error;
    }
  }

  // get user profile
  public async loadProfile(authorWalletAddress: string): Promise<IProfile> {
    return {
      address: authorWalletAddress,
      // image: "https://icon-library.com/images/vendetta-icon/vendetta-icon-14.jpg",
      image: "",
      name: await ethers.getDefaultProvider(EthereumService.ProviderEndpoints[process.env.NETWORK]).lookupAddress(authorWalletAddress) || null,
    };
  }

  public autoScrollAfter(pauseInMs: number): void {
    setTimeout(() => {
      window.scrollTo({
        left: 0,
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, pauseInMs); // Bypass page transaction repositioning
  }
  // edit comment by id?

  public async subscribeToDiscussion(discussionId: string, discussionMessageCallback: (commentStreamMessage: Types.Message) => void): Promise<void> {
    this.discussionsStreamService.initStreamPublishing(discussionId);
    this.eventAggregator.subscribe(COMMENTS_STREAM_UPDATED, discussionMessageCallback);
  }

  public unsubscribeFromDiscussion(): void {
    this.discussionsStreamService.unsubscribeFromDiscussion();
  }
}
