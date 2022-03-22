import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { IDealRegistrationTokenSwap, Platforms } from "entities/DealRegistrationTokenSwap";

import { IDealDiscussion } from "entities/DealDiscussions";

const address1 = "0xf525a861391e64d5126414434bFf877285378246";
const address2 = "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82";
const address3 = "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276";
const address4 = "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F";
const address5 = "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b";
const address6 = "0x3c6ad2029dbdd666dF667c3444897Bb3E758909E";
const proposalLeadAddress1 = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";
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
  key: "qKPjb-UsETIBQQKe_7LiS1eCHxuUwyVC3qzSslb5hus",
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
  key: "KHNUC5AJTNAdeKKRHY8EVdYcX8LA4IhQE4hFrsmjpBA",
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
  key: "8awiOeBryjLFPP1FuymzAp-iA7aHLnkIy9WCgkOt8Y8",
};
const discussion4: IDealDiscussion = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: true,
  createdAt: new Date("2022-01-27"),
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
    title: "How to design a product that can grow itself 10x in a year",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-3",
    name: "Rocket Ventures",
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
  createdAt: new Date("2022-02-01"),
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
  createdAt: new Date("2022-01-02"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};

const _registration5: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-03"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};

const _registration6: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-04"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration7: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-05"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration8: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-10"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration9: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-09"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration10: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-08"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration11: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-07"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration12: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-11"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration13: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-19"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration14: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-12"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration15: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-18"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration16: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-13"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration17: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-17"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration18: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-14"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration19: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA"}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-16"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration20: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
    ],
  },
  keepAdminRights: false,
  offersPrivate: false,
  isPrivate: false,
  createdAt: new Date("2022-01-15"),
  modifiedAt: null,
  createdByAddress: "",
  executionPeriodInDays: 50,
  dealType: "token-swap",
};
const _registration21: IDealRegistrationTokenSwap = {
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
    representatives: [{address: address1}, {address: address4}],
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
      {id: "clause-hash-1", text: "lorem"},
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
const _registration22: IDealRegistrationTokenSwap = {
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
      name: "Prime",
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

const _registration23: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "First Proposal",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-1",
    name: "FirstMyDAO",
    tokens: [{
      address: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
      name: "Prime",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
      amount: "3",
      instantTransferAmount: "2",
      vestedTransferAmount: "1",
      vestedFor: 5184000,
      cliffOf: 1728000,
    }],
    social_medias: [],
    representatives: [{
      address: address4,
    }, {
      address: address6,
    }],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
    platform: Platforms.DAOstack,
    treasury_address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA",
  },
  partnerDAO: {
    id: "partner-dao-hash-1",
    name: "TheirDAO",
    tokens: [
      {
        address: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
        amount: "3",
        instantTransferAmount: "2",
        vestedTransferAmount: "1",
        vestedFor: 5184000,
        cliffOf: 1728000,
        name: "Prime",
        symbol: "D2D",
        decimals: 18,
        logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/snapshots/spaces/primexyz.eth.png",
      },
      {
        address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
        amount: "2",
        instantTransferAmount: "1.5",
        vestedTransferAmount: "0.5",
        vestedFor: 1209600,
        cliffOf: 259200,
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
      },
    ],
    social_medias: [],
    representatives: [{address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA"}],
    logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
    platform: Platforms.Moloch,
    treasury_address: "0xD4717ee259f8736af189F968Dadc6939c1568200",
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

const _registration24: IDealRegistrationTokenSwap = {
  version: "0.0.1",
  proposal: {
    title: "Let’s spice up the world together",
    summary: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie. Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
  },
  primaryDAO: {
    id: "primary-dao-hash-1",
    name: "SecondMyDAO",
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
    representatives: [{address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA"}],
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
    "open_deals_stream_hash_4",
    "open_deals_stream_hash_5",
    "open_deals_stream_hash_6",
    "open_deals_stream_hash_7",
    "open_deals_stream_hash_8",
    "open_deals_stream_hash_9",
    "open_deals_stream_hash_10",
    "open_deals_stream_hash_11",
    "open_deals_stream_hash_12",
    "open_deals_stream_hash_13",
    "open_deals_stream_hash_14",
    "open_deals_stream_hash_15",
    "open_deals_stream_hash_16",
    "open_deals_stream_hash_17",
    "open_deals_stream_hash_18",
    "open_deals_stream_hash_19",
    "open_deals_stream_hash_20",
    "open_deals_stream_hash_21",
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
  "open_deals_stream_hash_4": {
    registration: "registration-hash-4",
    discussions: "clause-discussions-hash-4",
    votes: "votes-hash-4",
  },
  "open_deals_stream_hash_5": {
    registration: "registration-hash-5",
    discussions: "clause-discussions-hash-5",
    votes: "votes-hash-5",
  },
  "open_deals_stream_hash_6": {
    registration: "registration-hash-6",
    discussions: "clause-discussions-hash-6",
    votes: "votes-hash-6",
  },
  "open_deals_stream_hash_7": {
    registration: "registration-hash-7",
    discussions: "clause-discussions-hash-7",
    votes: "votes-hash-7",
  },
  "open_deals_stream_hash_8": {
    registration: "registration-hash-8",
    discussions: "clause-discussions-hash-8",
    votes: "votes-hash-8",
  },
  "open_deals_stream_hash_9": {
    registration: "registration-hash-9",
    discussions: "clause-discussions-hash-9",
    votes: "votes-hash-9",
  },
  "open_deals_stream_hash_10": {
    registration: "registration-hash-10",
    discussions: "clause-discussions-hash-10",
    votes: "votes-hash-10",
  },
  "open_deals_stream_hash_11": {
    registration: "registration-hash-11",
    discussions: "clause-discussions-hash-11",
    votes: "votes-hash-11",
  },
  "open_deals_stream_hash_12": {
    registration: "registration-hash-12",
    discussions: "clause-discussions-hash-12",
    votes: "votes-hash-12",
  },
  "open_deals_stream_hash_13": {
    registration: "registration-hash-13",
    discussions: "clause-discussions-hash-13",
    votes: "votes-hash-13",
  },
  "open_deals_stream_hash_14": {
    registration: "registration-hash-14",
    discussions: "clause-discussions-hash-14",
    votes: "votes-hash-14",
  },
  "open_deals_stream_hash_15": {
    registration: "registration-hash-15",
    discussions: "clause-discussions-hash-15",
    votes: "votes-hash-15",
  },
  "open_deals_stream_hash_16": {
    registration: "registration-hash-16",
    discussions: "clause-discussions-hash-16",
    votes: "votes-hash-16",
  },
  "open_deals_stream_hash_17": {
    registration: "registration-hash-17",
    discussions: "clause-discussions-hash-17",
    votes: "votes-hash-17",
  },
  "open_deals_stream_hash_18": {
    registration: "registration-hash-18",
    discussions: "clause-discussions-hash-18",
    votes: "votes-hash-18",
  },
  "open_deals_stream_hash_19": {
    registration: "registration-hash-19",
    discussions: "clause-discussions-hash-19",
    votes: "votes-hash-19",
  },
  "open_deals_stream_hash_20": {
    registration: "registration-hash-20",
    discussions: "clause-discussions-hash-20",
    votes: "votes-hash-20",
  },
  "open_deals_stream_hash_21": {
    registration: "registration-hash-21",
    discussions: "clause-discussions-hash-21",
    votes: "votes-hash-21",
  },
  "partnered_deals_stream_hash_1": {
    registration: "registration-hash-22",
    discussions: "clause-discussions-hash-22",
    votes: "votes-hash-22",
  },
  "partnered_deals_stream_hash_2": {
    registration: "registration-hash-23",
    discussions: "clause-discussions-hash-23",
    votes: "votes-hash-23",
  },
  "partnered_deals_stream_hash_3": {
    registration: "registration-hash-24",
    discussions: "clause-discussions-hash-24",
    votes: "votes-hash-24",
  },

  // Registration Mock
  "registration-hash-1": _registration1,
  "registration-hash-2": _registration2,
  "registration-hash-3": _registration3,
  "registration-hash-4": _registration4,
  "registration-hash-5": _registration5,
  "registration-hash-6": _registration6,
  "registration-hash-7": _registration7,
  "registration-hash-8": _registration8,
  "registration-hash-9": _registration9,
  "registration-hash-10": _registration10,
  "registration-hash-11": _registration11,
  "registration-hash-12": _registration12,
  "registration-hash-13": _registration13,
  "registration-hash-14": _registration14,
  "registration-hash-15": _registration15,
  "registration-hash-16": _registration16,
  "registration-hash-17": _registration17,
  "registration-hash-18": _registration18,
  "registration-hash-19": _registration19,
  "registration-hash-20": _registration20,
  "registration-hash-21": _registration21,
  "registration-hash-22": _registration22,
  "registration-hash-23": _registration23,
  "registration-hash-24": _registration24,

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
  "clause-discussions-hash-4": {},
  "clause-discussions-hash-5": {},
  "clause-discussions-hash-6": {},
  "clause-discussions-hash-7": {},
  "clause-discussions-hash-8": {},
  "clause-discussions-hash-9": {},
  "clause-discussions-hash-10": {},
  "clause-discussions-hash-11": {},
  "clause-discussions-hash-12": {},
  "clause-discussions-hash-13": {},
  "clause-discussions-hash-14": {},
  "clause-discussions-hash-15": {},
  "clause-discussions-hash-16": {},
  "clause-discussions-hash-17": {},
  "clause-discussions-hash-18": {},
  "clause-discussions-hash-19": {},
  "clause-discussions-hash-20": {},
  "clause-discussions-hash-21": {},
  "clause-discussions-hash-22": {},
  "clause-discussions-hash-23": {},
  "clause-discussions-hash-24": {
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
  "votes-hash-7": [],
  "votes-hash-8": [],
  "votes-hash-9": [],
  "votes-hash-10": [],
  "votes-hash-11": [],
  "votes-hash-12": [],
  "votes-hash-13": [],
  "votes-hash-14": [],
  "votes-hash-15": [],
  "votes-hash-16": [],
  "votes-hash-17": [],
  "votes-hash-18": [],
  "votes-hash-19": [],
  "votes-hash-20": [],
  "votes-hash-21": [],
  "votes-hash-22": [],
  "votes-hash-23": [],
  "votes-hash-24": [],

  // Discussions Mock
  "3b39cab51d207ad9f77e1ee4083337b00bbc707f": discussion1,
  "e853c854c6bafac799eea13582d6bd41fa6c0fd5": discussion2,
  "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766": discussion3,
  "41d17125b9e107857167b75341259a2b9cff6d13": discussion4,
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
