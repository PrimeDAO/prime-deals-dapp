import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { Platforms } from "entities/DealRegistrationTokenSwap";
import { DealStatus } from "entities/IDealTypes";

const _registration1: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Swap tokenized carbon credits for a better world",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "dao-hash-1",
    name: "Creator",
    tokens: [],
    social_medias: [],
    members: [],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
  },
  partnerDAO: null,
  proposalLead: {
    address: "0x0",
    email: "",
  },
  terms: {
    clauses: [

    ],
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-24"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};

const _registration2: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "First Proposal",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-2",
    name: "MyDAO",
    tokens: [],
    social_medias: [],
    members: ["0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b", "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E"],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
    platform: Platforms.DAOstack,
  },
  partnerDAO: null,
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
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: true,
  offersPrivate: true,
  isPrivate: true,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
  executionPeriodInDays: 45,
  dealType: "token-swap",
};

const _registration3: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Let’s spice up the world together",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-3",
    name: "MyDAO",
    tokens: [],
    social_medias: [],
    members: ["0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b", "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E"],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    platform: Platforms.DAOstack,
  },
  partnerDAO: null,
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
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: true,
  offersPrivate: true,
  isPrivate: true,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
  executionPeriodInDays: 45,
  dealType: "token-swap",
};

const _registration4: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Swap tokenized carbon credits for a better world",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "dao-hash-4",
    name: "MyDAO",
    tokens: [],
    social_medias: [],
    members: [],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
  },
  partnerDAO: {
    id: "dao-hash-5",
    name: "TheirDAO",
    tokens: [],
    social_medias: [],
    members: [],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
  },
  proposalLead: {
    address: "0x0",
    email: "",
  },
  terms: {
    clauses: [
      {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna", id: "clause-hash-1"},
      {text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr", id: "clause-hash-2"},
      {text: "Excepteur sint occaecat cupidatat id est laborum.", id: "clause-hash-3"},
      {text: "Clause without a discussion.", id: "clause-hash-4"},
    ],
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-24"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};

const _registration5: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "First Proposal",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
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
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
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
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
  executionPeriodInDays: 45,
  dealType: "token-swap",
};

const _registration6: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Let’s spice up the world together",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-1",
    name: "MyDAO",
    tokens: [],
    social_medias: [],
    members: ["0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b", "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E"],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    platform: Platforms.DAOstack,
  },
  partnerDAO: {
    id: "partner-dao-hash-1",
    name: "TheirDAO",
    tokens: [],
    social_medias: [],
    members: [],
    logo_url: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
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
    coreTeamChatURL: "",
    previousDiscussionURL: "",
  },
  keepAdminRights: true,
  offersPrivate: true,
  isPrivate: true,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
  executionPeriodInDays: 45,
  dealType: "token-swap",
};

const MOCK_DATA = {
  // Root stream - All deals ID's
  "root_stream_id": [
    "open_deals_stream_hash_1",
    "open_deals_stream_hash_2",
    "open_deals_stream_hash_3",
    "partnered_deals_stream_hash_1",
    "partnered_deals_stream_hash_2",
    "partnered_deals_stream_hash_3",
  ],
  // Deal Mock
  "open_deals_stream_hash_1": {
    registration: "registration-hash-1",
    discussions: "clause-discussions-hash-1",
    votes: "votes-hash-1",
    status: DealStatus.targetNotReached,
  },
  "open_deals_stream_hash_2": {
    registration: "registration-hash-2",
    discussions: "clause-discussions-hash-2",
    votes: "votes-hash-2",
    status: DealStatus.failed,
  },
  "open_deals_stream_hash_3": {
    registration: "registration-hash-3",
    discussions: "clause-discussions-hash-3",
    votes: "votes-hash-3",
    status: DealStatus.closed,
  },
  "partnered_deals_stream_hash_1": {
    registration: "registration-hash-4",
    discussions: "clause-discussions-hash-4",
    votes: "votes-hash-4",
    status: DealStatus.completed,
  },
  "partnered_deals_stream_hash_2": {
    registration: "registration-hash-5",
    discussions: "clause-discussions-hash-5",
    votes: "votes-hash-5",
    status: DealStatus.negotiating,
  },
  "partnered_deals_stream_hash_3": {
    registration: "registration-hash-6",
    discussions: "clause-discussions-hash-6",
    votes: "votes-hash-6",
    status: DealStatus.live,
  },

  // Registration Mock
  "registration-hash-1": _registration1,
  "registration-hash-2": _registration2,
  "registration-hash-3": _registration3,
  "registration-hash-4": _registration4,
  "registration-hash-5": _registration5,
  "registration-hash-6": _registration6,

  // Discussions Mock Map
  "clause-discussions-hash-1": {},
  "clause-discussions-hash-2": {
    "clause-hash-1": "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
    "clause-hash-2": "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
    "clause-hash-3": "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
  },
  "clause-discussions-hash-3": {},
  "clause-discussions-hash-4": {},
  "clause-discussions-hash-5": {},
  "clause-discussions-hash-6": {},

  // Votes Mock
  "votes-hash-1": [],
  "votes-hash-2": [],
  "votes-hash-3": [],
  "votes-hash-4": [],
  "votes-hash-5": [],
  "votes-hash-6": [],

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
