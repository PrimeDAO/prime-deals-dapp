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
  modifiedAt: Date,
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
  version: string;
  discussionId: Hash;
  isPrivate: boolean;
  createdAt: Date | null;
  modifiedAt: Date | null;
  createdByAddress: string | null;
  createdByName?: string | null;
  members: Array<string>;
  admins: Array<string>;
  topic: string;
  clauseId: number | null;
  replies: number;
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
