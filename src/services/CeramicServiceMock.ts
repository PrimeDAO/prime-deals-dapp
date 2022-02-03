import { DealRegistrationData, IDAO } from "entities/DealRegistrationData";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";

export const discussion_hash1 = {
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
};
export const discussion_hash2 = {
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
};
export const discussion_hash3 = {
  version: "0.0.1",
  discussionId: "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
  topic: "Excepteur sint occaecat cupidatat id est laborum.",
  clauseId: 2,
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
};
export const discussion_hash4 = {
  version: "0.0.1",
  discussionId: "18a416630e1ab87c7d24d960bfd3a0f72a61b9e0",
  topic: "Clause without a discussion.",
  clauseId: 3,
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
};

const MOCK_DATA = {
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id", "open_deals_stream_id_2"],
  "open_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
      ]as Partial<IDAO>[],
    },
  },
  "open_deals_stream_id_2": {
    registration: {
      ...new DealRegistrationData(),
      proposal: {
        title: "First Proposal",
        summary: "Quick summary",
        description: "Long description lorem ipsum",
      },
      proposalLead: {
        address: "0x123123123",
        email: "",
      },
      terms: {
        clauses: [
          {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna", tag: "tag1"},
          {text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr", tag: "tag2"},
          {text: "Excepteur sint occaecat cupidatat id est laborum.", tag: "tag3"},
          {text: "Clause without a discussion.", tag: "tag4"},
        ],
      },
    },
    discussions: [
      discussion_hash1.discussionId,
      discussion_hash2.discussionId,
      discussion_hash3.discussionId,
    ],
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  "partner_deals_stream_id": {
    registration: {
      daos: [
        {name: "Creator"},
        {name: "Partner"},
      ]as Partial<IDAO>[],
    },
    // discussions: DISCUSSION_MOCK_MAP,
  },
  [discussion_hash1.discussionId]: discussion_hash1,
  [discussion_hash2.discussionId]: discussion_hash2,
  [discussion_hash3.discussionId]: discussion_hash3,
  [discussion_hash4.discussionId]: discussion_hash4,
} as const;

export class CeramicServiceMock extends IDataSourceDeals {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public initialize(rootId?: IKey): void {
    // throw new Error("Method not implemented.");
  }

  public get<T>(id: IKey): T {
    return MOCK_DATA[id] as unknown as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public create(registration: IKey): Promise<string> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(id: IKey, data: string): Promise<IKey> {
    throw new Error("Method not implemented.");
  }
}
