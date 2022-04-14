export interface ICommentMetaData {
  isPrivate: string; // "false";
  allowedMembers: string; // "[\"0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498\"]";
  encrypted: string; // "";
  iv: string; // "";
  isDeleted?: boolean;
}

export interface IComment {
  // Following the comment structure of `theconvo.space` api:
  _id: string;
  text: string;
  author: string;
  authorENS?: string;
  metadata: ICommentMetaData;
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
  replies: number;
  key: string;
}
