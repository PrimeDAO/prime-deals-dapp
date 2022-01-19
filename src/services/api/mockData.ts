import { IClause } from "configurations/apiSchema";

export const DEAL_CLAUSES: Array<IClause> = [
  {
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
    discussionThread: {
      threadId: "0x891ac160551a35b586b7e304aac9287904773bd7047388111ceefac5d3a108bc",
      creator: "John Doe",
      createdAt: new Date(2022, 0, 1),
    },
  },
  {
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
    discussionThread: {
      threadId: "0xae506662f1b14ab626da1df812f43ecffb9fbae37c43a43b42263b3d89494958",
      creator: "John Doe",
      createdAt: new Date(2022, 0, 1),
    },
  },
  {
    description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    discussionThread: {
      threadId: "0x54d1c476fe9997e6ad758cc8ca32160f5deef3fbc4e57f747f433978af8a0c11",
      creator: "John Doe",
      createdAt: new Date(2022, 0, 2),
    },
  },
  {
    description: "Culpa qui officia deserunt mollit anim id est laborum.",
    discussionThread: {
      threadId: undefined,
      creator: "John Doe",
      createdAt: new Date(2022, 0, 2),
    },
  },
  {
    description: "Excepteur sint occaecat cupidatat id est laborum.",
    discussionThread: {
      threadId: undefined,
      creator: "John Doe",
      createdAt: new Date(2022, 0, 2),
    },
  },
];
