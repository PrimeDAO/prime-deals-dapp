export interface IComment {
  // Following the comment structure of `theconvo.space` api:
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

export interface IConvoComment {
  _id: string;
  text: string;
  author: string;
  authorENS?: string;
  metadata: any;
  replyTo?: string;
  upvotes: Array<string>;
  downvotes: Array<string>;
  createdOn: string;
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
  discussionId: string;
  createdAt: string | null;
  modifiedAt: string | null;
  createdBy: {
    address: string,
    name?: string | null;
  } | null;
  representatives: Array<{address: string}>;
  admins: Array<{address: string}>;
  topic: string;
  replies: number;
  key: string;
  dealId: string;
}

export class DealDiscussion implements IDealDiscussion {
  public discussionId: string;
  public version: string;
  public isPrivate: boolean;
  public createdAt: string | null;
  public modifiedAt: string | null;
  public createdBy: {address: string, name?: string | null} | null;
  public representatives: Array<{address: string}>;
  public admins: Array<{address: string}>;
  public topic: string;
  public replies: number;
  public key: string;
  public dealId: string;
}
