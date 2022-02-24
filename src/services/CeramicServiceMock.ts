import { IDealDiscussion } from "entities/DealDiscussions";
import { IDealRegistrationTokenSwap, Platforms } from "entities/DealRegistrationTokenSwap";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
const address1 = "0xf525a861391e64d5126414434bFf877285378246";
const address2 = "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82";
const address3 = "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276";
const address4 = "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F";
const address5 = "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b";
const address6 = "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E";
const proposalLeadAddress1 = "0x8625F29e4d06D0a3998Ed8C9E45F4b04C7b28D00";
const tokenAddress1 = "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad";

const discussion1: IDealDiscussion = {
  version: "0.0.1",
  discussionId: "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
  topic: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
  clauseIndex: 0,
  admins: [{
    address: address5,
  }],
  representatives: [{
    address: address5,
  }],
  createdBy: {address: address4},
  createdAt: new Date("2022-01-23T15:38:16.528Z"),
  modifiedAt: new Date(1643031030746),
  replies: 6,
};
const discussion2: IDealDiscussion = {
  version: "0.0.1",
  discussionId: "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
  topic: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
  clauseIndex: 1,
  admins: [{
    address: address5,
  }],
  representatives: [{
    address: address5,
  }],
  createdBy: {address: address4},
  createdAt: new Date("2022-01-21T15:48:32.753Z"),
  modifiedAt: new Date(1642846275332),
  replies: 10,
};
const discussion3: IDealDiscussion = {
  version: "0.0.1",
  discussionId: "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
  topic: "Excepteur sint occaecat cupidatat id est laborum.",
  clauseIndex: 2,
  admins: [{
    address: address4,
  }],
  representatives: [{
    address: address4,
  }],
  createdBy: {address: address4},
  createdAt: new Date("2022-01-22T20:57:43.707Z"),
  modifiedAt: null,
  replies: 0,
};
const discussion4: IDealDiscussion = {
  version: "0.0.1",
  discussionId: "18a416630e1ab87c7d24d960bfd3a0f72a61b9e0",
  topic: "Clause without a discussion.",
  clauseIndex: 3,
  admins: [{
    address: address4,
  }],
  representatives: [{
    address: address4,
  }],
  createdBy: {address: address4},
  createdAt: new Date("2022-01-22T20:57:43.707Z"),
  modifiedAt: null,
  replies: 0,
};

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
    representatives: [{address: address1}],
    treasury_address: address2,
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
  },
  partnerDAO: undefined,
  proposalLead: {
    address: proposalLeadAddress1,
    email: "",
  },
  terms: {
    clauses: [
      {id: "", text: "lorem"},
    ],
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
    treasury_address: address3,
    social_medias: [{
      name: "Twitter",
      url: "https://twitter.com",
    }],
    representatives: [{
      address: address4,
    }, {
      address: address6,
    }],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
    platform: Platforms.DAOstack,
  },
  partnerDAO: undefined,
  proposalLead: {
    address: proposalLeadAddress1,
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
  isPrivate: false,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: address4,
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
    representatives: [{
      address: address4,
    }, {
      address: address6,
    }],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    platform: Platforms.DAOstack,
    treasury_address: "",
  },
  partnerDAO: undefined,
  proposalLead: {
    address: proposalLeadAddress1,
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
  isPrivate: false,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: address4,
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
    representatives: [{address: address1}],
    treasury_address: address2,
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
  },
  partnerDAO: {
    id: "dao-hash-5",
    name: "PrimeDAO",
    tokens: [{
      address: tokenAddress1,
      name: "Prime (D2D)",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/21609/small/RJD82RrV_400x400.jpg?1639559164",
      amount: "200000",
      instantTransferAmount: "150000",
      vestedTransferAmount: "50000",
      vestedFor: 14,
      cliffOf: 3,
    }],
    treasury_address: address3,
    representatives: [{address: address4}],
    social_medias: [{name: "Twitter", url: "http://twitter.com/their-dao"}, {name: "Facebook", url: "http://facebook.com/their-dao"}],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
  },
  proposalLead: {
    address: proposalLeadAddress1,
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
    representatives: [{
      address: address4,
    }, {
      address: address6,
    }],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
    platform: Platforms.DAOstack,
    treasury_address: "",
  },
  partnerDAO: {
    id: "partner-dao-hash-1",
    name: "TheirDAO",
    tokens: [],
    social_medias: [],
    representatives: [{address: ""}],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
    platform: Platforms.Moloch,
    treasury_address: "",
  },
  proposalLead: {
    address: proposalLeadAddress1,
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
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: address4,
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
    representatives: [{
      address: address4,
    }, {
      address: address6,
    }],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    platform: Platforms.DAOstack,
    treasury_address: "",
  },
  partnerDAO: {
    id: "partner-dao-hash-1",
    name: "TheirDAO",
    tokens: [],
    social_medias: [],
    representatives: [{address: ""}],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
    platform: Platforms.Moloch,
    treasury_address: "",
  },
  proposalLead: {
    address: proposalLeadAddress1,
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
  isPrivate: false,
  createdAt: new Date("2022-02-02"),
  modifiedAt: null,
  createdByAddress: address4,
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
  },
  "open_deals_stream_hash_2": {
    registration: "registration-hash-2",
    discussions: "clause-discussions-hash-2",
    votes: "votes-hash-2",
  },
  "open_deals_stream_hash_3": {
    registration: "registration-hash-3",
    discussions: "clause-discussions-hash-3",
    votes: "votes-hash-3",
  },
  "partnered_deals_stream_hash_1": {
    registration: "registration-hash-4",
    discussions: "clause-discussions-hash-4",
    votes: "votes-hash-4",
  },
  "partnered_deals_stream_hash_2": {
    registration: "registration-hash-5",
    discussions: "clause-discussions-hash-5",
    votes: "votes-hash-5",
  },
  "partnered_deals_stream_hash_3": {
    registration: "registration-hash-6",
    discussions: "clause-discussions-hash-6",
    votes: "votes-hash-6",
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
  "clause-discussions-hash-6": {
    "clause-hash-1": "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
    "clause-hash-2": "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
    "clause-hash-3": "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
  },

  // Votes Mock
  "votes-hash-1": [],
  "votes-hash-2": [],
  "votes-hash-3": [],
  "votes-hash-4": [],
  "votes-hash-5": [],
  "votes-hash-6": [],

  // Discussions Mock
  "3b39cab51d207ad9f77e1ee4083337b00bbc707f": discussion1,
  "e853c854c6bafac799eea13582d6bd41fa6c0fd5": discussion2,
  "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766": discussion3,
  "discussion-hash-4": discussion4,
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
    return MOCK_DATA[id] = JSON.parse(data);
  }
}
