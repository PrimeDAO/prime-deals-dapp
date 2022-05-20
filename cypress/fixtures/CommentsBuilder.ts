import { IComment } from "../../src/entities/DealDiscussions";
import { E2E_ADDRESSES, getRandomId } from "./dealFixtures";

type Address = string;

export class CommentBuilder {
  public comment: IComment = {
    _id: getRandomId(),
    // @ts-ignore
    _mod: 1649261774793092400,
    author: E2E_ADDRESSES.ProposalLead,
    // chain: "ethereum",
    createdOn: "1649261198841",
    downvotes: [],
    // editHistory: [],
    metadata: {
      isPrivate: "false",
      encrypted: "",
      iv: "",
    },
    replyTo: "",
    // tag1: "",
    // tag2: "",
    text: "This comment is encrypted",
    // tid: "floresta_open_3:4",
    upvotes: [],
    // url: "https://deals.prime.xyz",
    authorENS: "",
  };

  public static create() {
    return new CommentBuilder();
  }

  public withAuthor(author: Address): CommentBuilder {
    this.comment.author = author;
    return this;
  }

  public withText(text: string): CommentBuilder {
    this.comment.text = text;
    return this;
  }

  public withPrivacy(isPrivate: "true" | "false"): CommentBuilder {
    this.comment.metadata.isPrivate = isPrivate;
    return this;
  }

  public replyTo(targetComment: IComment): CommentBuilder {
    this.comment.replyTo = targetComment._id;
    return this;
  }
}
