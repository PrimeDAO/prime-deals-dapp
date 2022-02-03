import { Hash } from "services/EthereumService";

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
  authorName?: string,
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

export type TCommentDictionary = {
  [key: string]: IComment
}

export enum VoteType {
  "upvote",
  "downvote"
}

export interface IDealDiscussion {
  discussionId: Hash;
  version: string;
  isPrivate: boolean;
  createdAt: Date | null;
  modifiedAt: Date | null;
  createdByAddress: string | null;
  members: Array<string>;
  admins: Array<string>;
  topic: string;
  clauseId: number | null;
}

export interface IDealDiscussions {
  items: Record<Hash, IDealDiscussion>,
  hydrate: () => Promise<void>,
}

export class DealDiscussion implements IDealDiscussion {
  public discussionId: Hash;
  public version: string;
  public isPrivate: boolean;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;
  public members: Array<string>;
  public admins: Array<string>;
  public topic: string;
  public clauseId: number | null;
  public replies: number;
}

export class DealDiscussions implements IDealDiscussions {
  public items: Record<Hash, DealDiscussion>;

  constructor() {
    this.hydrate();
  }

  public async hydrate(): Promise<void> {
    // TODO: implement get discussions from Data storage
    this.items = {
      "3b39cab51d207ad9f77e1ee4083337b00bbc707f": {
        version: "0.0.1",
        discussionId: "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
        topic: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
        clauseId: 0,
        admins: [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        members: [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        isPrivate: false,
        createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        createdAt: new Date("2022-01-23T15:38:16.528Z"),
        modifiedAt: new Date(1643031030746),
        replies: 6,
      },

      "e853c854c6bafac799eea13582d6bd41fa6c0fd5": {
        version: "0.0.1",
        discussionId: "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
        topic: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
        clauseId: 1,
        admins: [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        members: [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        isPrivate: true,
        createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        createdAt: new Date("2022-01-21T15:48:32.753Z"),
        modifiedAt: new Date(1642846275332),
        replies: 10,
      },

      "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766": {
        version: "0.0.1",
        discussionId: "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
        topic: "Excepteur sint occaecat cupidatat id est laborum.",
        clauseId: 4,
        admins: [
          "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        ],
        members: [
          "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        ],
        isPrivate: true,
        createdByAddress: "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        createdAt: new Date("2022-01-22T20:57:43.707Z"),
        modifiedAt: null,
        replies: 0,
      },
    };
  }
}
