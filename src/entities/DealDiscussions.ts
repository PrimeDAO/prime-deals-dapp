export interface IComment {
  // Following the comment structure of `theconvo.space` api:
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
  createdAt: string | null;
  modifiedAt: string | null;
  createdBy: {
    address: string,
    name?: string | null;
  } | null;
  topic: string;
  replies: number;
  key: string;
}

export class DealDiscussion implements IDealDiscussion {
  public version: string;
  public createdAt: string | null;
  public modifiedAt: string | null;
  public createdBy: {address: string, name?: string | null} | null;
  public topic: string;
  public replies: number;
  public key: string;
}
