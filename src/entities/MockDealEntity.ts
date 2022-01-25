import { IDummyDeal } from "./Deal";

export const OPEN_DEALS_MOCK: IDummyDeal[] = [
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 2 With a Looooong Name",
    },
    type: "Token Swap",
    title: "Swap tokenized carbon credits for a better world",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    },
    status: "contributingIsOpen",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 1",
    },
    type: "Joint Venture",
    title: "Let’s spice up the world together",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    },
    status: "hasNotStarted",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 2 With a Looooong Name",
    },
    type: "Token Swap",
    title: "Proposal Title",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    },
    status: "claimingIsOpen",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
];

export const PARTNERED_DEALS_MOCK: IDummyDeal[] = [
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 1",
      partner: "DAO Partner 1",
    },
    type: "Joint Venture",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
      partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
    },
    status: "incomplete",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 2 With a Looooong Name",
      partner: "DAO Partner 2",
    },
    type: "Token Swap",
    title: "Proposal Title",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
      partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
    },
    status: "uninitialized",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
  {
    address: "0x1jk3lk4353l45kj345l3k45j345",
    dao: {
      creator: "DAO Creator 1",
      partner: "DAO Partner 1",
    },
    type: "Joint Venture",
    title: "Proposal Title",
    description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
    logo: {
      creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
      partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
    },
    status: "isClosed",
    startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
  },
];
