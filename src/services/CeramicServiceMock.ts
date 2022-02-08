import { Platforms } from "./../entities/DealRegistrationTokenSwap";
import { DealRegistrationTokenSwap, IDAO } from "entities/DealRegistrationTokenSwap";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";

const MOCK_DATA = {
  // Root stream - All deals ID's
  "root_stream_id": ["open_deals_stream_id", "partner_deals_stream_id", "open_deals_stream_id_2"],
  // Deal Mock
  "open_deals_stream_id": {
    registration: "registration-hash-1",
    discussions: "clause-discussions-hash-1",
    votes: "votes-hash-1",
  },
  "open_deals_stream_id_2": {
    registration: "registration-hash-2",
    discussions: "clause-discussions-hash-2",
    votes: "votes-hash-2",
  },
  "partner_deals_stream_id": {
    registration: "registration-hash-3",
    discussions: "clause-discussions-hash-3",
    votes: "votes-hash-3",
  },

  // Registration Mock
  "registration-hash-1": {
    ...new DealRegistrationTokenSwap(),
    daos: [
      {name: "Creator"},
    ]as Partial<IDAO>[],
  },
  "registration-hash-2": {
    ...new DealRegistrationTokenSwap(),
    version: "0.0.1",
    proposal: {
      title: "First Proposal",
      summary: "Quick summary",
      description: "Long description lorem ipsum",
    },
    primaryDAO: {
      id: "primary-dao-hash-1",
      name: "MyDAO",
      tokens: [],
      social_medias: [],
      members: ["0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b", "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E"],
      logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
      platform: Platforms.DAOstack,
    },
    partnerDAO: {
      id: "partner-dao-hash-1",
      name: "TheirDAO",
      tokens: [],
      social_medias: [],
      members: [],
      logo_url: "",
      platform: Platforms.Moloch,
    },
    proposalLead: {
      address: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
      email: "",
    },
    terms: {
      clauses: [
        {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna", id: "clause-hash-1"},
        {text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr", id: "clause-hash-2"},
        {text: "Excepteur sint occaecat cupidatat id est laborum.", id: "clause-hash-3"},
        {text: "Clause without a discussion.", id: "clause-hash-4"},
      ],
    },
    keepAdminRights: true,
    offersPrivate: true,
    isPrivate: true,
    createdAt: new Date("2022-02-02"),
    modifiedAt: null,
    createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
    executionPeriodInDays: 45,
    dealType: "token-swap",
  },
  "registration-hash-3": {
    ...new DealRegistrationTokenSwap(),
    daos: [
      {name: "Creator"},
      {name: "Partner"},
    ] as Partial<IDAO>[],
    discussions: {},
    votes: [],
  },

  // Discussions Mock Map
  "clause-discussions-hash-1": {},
  "clause-discussions-hash-2": {
    "clause-hash-1": "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
    "clause-hash-2": "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
    "clause-hash-3": "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
  },
  "clause-discussions-hash-3": {},

  // Votes Mock
  "votes-hash-1": [],
  "votes-hash-2": [],
  "votes-hash-3": [],

  // Discussions Mock
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
  },
  "discussion-hash-4": {
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
  },
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
  public create(parent: IKey): Promise<IKey> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(id: IKey, data: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
