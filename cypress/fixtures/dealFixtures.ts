import { IDealRegistrationTokenSwap } from "../../src/entities/DealRegistrationTokenSwap";

const address1 = "0xf525a861391e64d5126414434bFf877285378246";
const address2 = "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82";
const address3 = "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276";
const address4 = "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F";
export const proposalLeadAddress1 = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";
export const CONNECTED_PUBLIC_USER_ADDESS = "0x0000000000000000000000000000000000000000";
const tokenAddress1 = "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad";

export const E2E_ADDRESSES = {
  ProposalLead: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
  PrimaryDAOToken: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
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
