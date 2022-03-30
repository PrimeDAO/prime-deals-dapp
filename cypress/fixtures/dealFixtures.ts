import { IDealRegistrationTokenSwap, Platforms } from "../../src/entities/DealRegistrationTokenSwap";

const address1 = "0xf525a861391e64d5126414434bFf877285378246";
const address2 = "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82";
const address3 = "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276";
const address4 = "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F";
const address5 = "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b";
const address6 = "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E";
export const proposalLeadAddress1 = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";
export const CONNECTED_PUBLIC_USER_ADDESS = "0x0000000000000000000000000000000000000000";
const tokenAddress1 = "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad";

export const E2E_ADDRESSES = {
  ProposalLead: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
  PrimaryDAOToken: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
};

const discussion1 = {
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
  key: "qKPjb-UsETIBQQKe_7LiS1eCHxuUwyVC3qzSslb5hus",
};
const discussion2 = {
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
  key: "KHNUC5AJTNAdeKKRHY8EVdYcX8LA4IhQE4hFrsmjpBA",
};
const discussion3 = {
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
  key: "8awiOeBryjLFPP1FuymzAp-iA7aHLnkIy9WCgkOt8Y8",
};
const discussion4 = {
  version: "0.0.1",
  discussionId: "41d17125b9e107857167b75341259a2b9cff6d13",
  topic: "Clause without a discussion.",
  clauseIndex: 3,
  admins: [{
    address: address4,
  }],
  representatives: [{
    address: address4,
  }],
  createdBy: {address: address4},
  createdAt: new Date("2022-01-26T20:57:43.707Z"),
  modifiedAt: null,
  replies: 0,
  key: "-i90irriG3hu8xJs1g0c7LtTCtGiYmU5m3hZSfcIPz0",
};

export const MINIMUM_OPEN_PROPOSAL: IDealRegistrationTokenSwap = {
  dealType: "token-swap",
  proposal: {
    summary: "Summary Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
    description: "Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci.",
    title: "First Proposal",
  },
  offersPrivate: false,
  fundingPeriod: 864000,
  isPrivate: false,
  version: "0.0.2",
  proposalLead: {
    address: proposalLeadAddress1,
    email: "",
  },
  primaryDAO: {
    treasury_address: "0xe904078dBE5Cb9973869B7bDA1C88189986C77fB",
    logoURI: "https://picsum.photos/seed/picsum/400/400",
    social_medias: [
      {
        url: "https://twitter.com/PrimeDAO_",
        name: "Twitter",
      },
    ],
    name: "PrimeDAO",
    tokens: [
      {
        symbol: "D2D",
        amount: "500000000000",
        address: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
        vestedFor: 8640000,
        logoURI:
          "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
        vestedTransferAmount: "400000000000",
        instantTransferAmount: "100000000000",
        decimals: 18,
        name: "Prime",
        cliffOf: 864000,
      },
    ],
    representatives: [
      {
        address: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
      },
      {
        address: "0xe835f975d731Aa8515DD3Da9ec8a82e1DEF33c34",
      },
    ],
  },
  keepAdminRights: true,
  terms: {
    clauses: [
      {
        id: "",
        text: "Clause ONE",
      },
    ],
  },
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
    tokens: [
      {
        address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
        amount: "50000000000000000000",
        instantTransferAmount: "40000000000000000000",
        vestedTransferAmount: "10000000000000000000",
        vestedFor: 5184000,
        cliffOf: 1728000,
        name: "Prime",
        symbol: "D2D",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
      },
    ],
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
  fundingPeriod: 45,
  dealType: "token-swap",
};

export const PARTNERED_DEAL: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Swap tokenized carbon credits for a better world",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "dao-hash-4",
    name: "MyDAO",
    tokens: [
      {
        address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
        amount: "50000000000000000000",
        instantTransferAmount: "40000000000000000000",
        vestedTransferAmount: "10000000000000000000",
        vestedFor: 5184000,
        cliffOf: 1728000,
        name: "Prime",
        symbol: "D2D",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
      },
      {
        address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
        amount: "50000000000000000000",
        instantTransferAmount: "40000000000000000000",
        vestedTransferAmount: "10000000000000000000",
        vestedFor: 5184000,
        cliffOf: 1728000,
        name: "Prime",
        symbol: "D2D",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
      },
    ],
    social_medias: [
      {
        url: "http://social.one.io",
        name: "Twitter",
      },
      {
        url: "http://two.social.io",
        name: "Reddit",
      },
    ],
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
      vestedFor: 14 * 24 * 3600, // should be in seconds
      cliffOf: 3 * 24 * 3600, // should be in seconds
    }],
    treasury_address: address3,
    representatives: [{address: address4}],
    social_medias: [{name: "Twitter", url: "http://twitter.com/their-dao"}, {name: "Telegram", url: "http://telegram.com/their-dao"}],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
  },
  proposalLead: {
    address: proposalLeadAddress1,
    email: "lorem@ipsum.xyz",
  },
  terms: {
    clauses: [
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  fundingPeriod: 50,
  dealType: "token-swap",
};

const MOCK_DATA = {
  // Root stream - All deals ID's
  "root_stream_id": [
    "open_deals_stream_hash_1",
    "open_deals_stream_hash_2",
    "partnered_deals_stream_hash_1",
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
  "partnered_deals_stream_hash_1": {
    registration: "registration-hash-3",
    discussions: "clause-discussions-hash-3",
    votes: "votes-hash-3",
  },

  // Registration Mock
  "registration-hash-1": MINIMUM_OPEN_PROPOSAL,
  "registration-hash-2": _registration2,
  "registration-hash-3": PARTNERED_DEAL,

  // Discussions Mock Map
  "clause-discussions-hash-1": {
    "clause-hash-1": "41d17125b9e107857167b75341259a2b9cff6d13",
  },
  "clause-discussions-hash-2": {
    "clause-hash-1": "3b39cab51d207ad9f77e1ee4083337b00bbc707f",
    "clause-hash-2": "e853c854c6bafac799eea13582d6bd41fa6c0fd5",
    "clause-hash-3": "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766",
    "clause-hash-4": "41d17125b9e107857167b75341259a2b9cff6d13",
  },
  "clause-discussions-hash-3": {},

  // Votes Mock
  "votes-hash-1": [],
  "votes-hash-2": [],
  "votes-hash-3": [],

  // Discussions Mock
  "3b39cab51d207ad9f77e1ee4083337b00bbc707f": discussion1,
  "e853c854c6bafac799eea13582d6bd41fa6c0fd5": discussion2,
  "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766": discussion3,
  "41d17125b9e107857167b75341259a2b9cff6d13": discussion4,
} as const;
