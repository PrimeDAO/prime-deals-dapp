/* eslint-disable comma-spacing */
/* eslint-disable no-multi-spaces */
import { IDealRegistrationTokenSwap, IRepresentative } from "../../src/entities/DealRegistrationTokenSwap";
import { AvailableTokenNames, TokenBuilder } from "./bulders/TokenBuilder";

function getRandomId (){
  /**
   * "0.g6ck5nyod4".substring(2, 9)
   * -> g6ck5ny
   */
  return Math.random().toString(36).substring(2, 9);
}
const randomId = getRandomId();

export const E2E_ADDRESSES = {
  ConnectedPublicUser: "0x0000000000000000000000000000000000000000",
  // ------ Primary
  ProposalLead: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
  RepresentativeTwo: "0xd1F29D0e34c7A9D54f607733e5A113493c58F1Cb", /** TODO: should become PrimaryRepresentativeTwo */
  PrimaryRepresentativeThree: "0xEf9a0BaCf7836FbCda9892742dA142e528A98937",
  PrimaryRepresentativeFour: "0x7601F2bbA7E9045f06b41B4734dB7dd0D60d5786",
  PrimaryRepresentativeFive: "0xC602f4f1829442acA1ebBE1010C55b6b27f4134b",
  PrimaryDAOToken: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
  PrimaryTreasury: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
  // ------ Partner
  RepresentativeOne: "0xBf3a5599f2f6CE89862d640a248e31F30B7ddF29",
  PartnerRepresentativeTwo: "0x622D9f71152A3e8EDD114a9b211812b51fFCcB00",
  PartnerRepresentativeThree: "0x5D45BAa08C7936A7b788c191Ae6862C392eE32Fe",
  PartnerRepresentativeFour: "0x1573e541a10cBbd74e9C644Bbef2073532c33A2B",
  PartnerRepresentativeFive: "0x45802BfeBc62747001f33dCf171aACD86ca774f6",
  PartnerTreasury: "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276",
  PartnerTreasuryTwo: "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82",
};

export const E2E_ADDRESSES_PRIVATE_KEYS = {
  // ------ Primary
  [E2E_ADDRESSES.ProposalLead]: process.env.ADDRESSES_PROPOSAL_LEAD,
  [E2E_ADDRESSES.RepresentativeTwo]: process.env.ADDRESSES_REPRESENTATIVE_TWO,
  [E2E_ADDRESSES.PrimaryRepresentativeThree]: process.env.ADDRESSES_PRIMARY_REPRESENTATIVE_THREE,
  [E2E_ADDRESSES.PrimaryRepresentativeFour]: process.env.ADDRESSES_PRIMARY_REPRESENTATIVE_FOUR,
  [E2E_ADDRESSES.PrimaryRepresentativeFive]: process.env.ADDRESSES_PRIMARY_REPRESENTATIVE_FIVE,
  // ------ Partner
  [E2E_ADDRESSES.RepresentativeOne]: process.env.ADDRESSES_REPRESENTATIVE_ONE,
  [E2E_ADDRESSES.PartnerRepresentativeTwo]: process.env.ADDRESSES_PARTNER_REPRESENTATIVE_TWO,
  [E2E_ADDRESSES.PartnerRepresentativeThree]: process.env.ADDRESSES_PARTNER_REPRESENTATIVE_THREE,
  [E2E_ADDRESSES.PartnerRepresentativeFour]: process.env.ADDRESSES_PARTNER_REPRESENTATIVE_FOUR,
  [E2E_ADDRESSES.PartnerRepresentativeFive]: process.env.ADDRESSES_PARTNER_REPRESENTATIVE_FIVE,
};

const PROPOSAL_DATA = {
  summary: `${randomId}_summary`,
  description: `${randomId}_description`,
  title: `${randomId}_Open_proposal`,
};

const PROPOSAL_LEAD_DATA = {
  address: E2E_ADDRESSES.ProposalLead,
  email: "",
};

const TOKEN_DATA = {
  symbol: "D2D",
  amount: "500000000000",
  address: E2E_ADDRESSES.PrimaryDAOToken,
  vestedFor: 8640000,
  logoURI:
    "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
  vestedTransferAmount: "400000000000",
  instantTransferAmount: "100000000000",
  decimals: 18,
  name: "Prime",
  cliffOf: 864000,
};

const TWITTER_SOCIAL_MEDIA_DATA = {
  url: "https://twitter.com/PrimeDAO_",
  name: "Twitter",
};

const PRIMARY_DAO_DATA = {
  treasury_address: E2E_ADDRESSES.ProposalLead,
  logoURI: "https://picsum.photos/seed/picsum/400/400",
  social_medias: [TWITTER_SOCIAL_MEDIA_DATA],
  name: `${randomId}_PrimeDAO`,
  tokens: [TOKEN_DATA],
  representatives: [
    {
      address: E2E_ADDRESSES.ProposalLead,
    },
  ],
};

const PARTNER_DAO_DATA = {
  name: `${randomId}_PartnerDAO`,
  tokens: [
    {
      address: E2E_ADDRESSES.PrimaryDAOToken,
      name: "Prime (D2D)",
      symbol: "D2D",
      decimals: 18,
      logoURI:
        "https://assets.coingecko.com/coins/images/21609/small/RJD82RrV_400x400.jpg?1639559164",
      amount: "200000",
      instantTransferAmount: "150000",
      vestedTransferAmount: "50000",
      vestedFor: 14 * 24 * 3600, // should be in seconds
      cliffOf: 3 * 24 * 3600, // should be in seconds
    },
  ],
  treasury_address: E2E_ADDRESSES.PartnerTreasury,
  representatives: [{ address: E2E_ADDRESSES.RepresentativeOne }],
  social_medias: [
    { name: "Twitter", url: "http://twitter.com/their-dao" },
    { name: "Telegram", url: "http://telegram.com/their-dao" },
  ],
  logoURI:
    "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
};

const TERMS_DATA = {
  clauses: [
    {
      id: randomId,
      text: `${randomId}_clause`,
    },
  ],
};

export class DealDataBuilder {
  public deal: IDealRegistrationTokenSwap = {
    version: "0.0.2",
    dealType: "token-swap",
    offersPrivate: false,
    isPrivate: false,
    keepAdminRights: true,
    fundingPeriod: 864000,
    proposal: PROPOSAL_DATA,
    proposalLead: PROPOSAL_LEAD_DATA,
    primaryDAO: PRIMARY_DAO_DATA,
    terms: TERMS_DATA,
  };

  public static create() {
    return new DealDataBuilder();
  }

  public withProposalData = this.withFactory("proposal");
  public withProposalLeadData = this.withFactory("proposalLead");
  public withPrimaryDaoData = this.withFactory("primaryDAO");
  public withPartnerDaoData = this.withFactory("partnerDAO", PARTNER_DAO_DATA);
  public withTermsData = this.withFactory("terms");

  public withPrimaryDaoRepresentative(newRepresentatives: Array<IRepresentative>) {
    this.deal.primaryDAO.representatives.push(...newRepresentatives);
    return this;
  }

  private withFactory<DealKey extends keyof IDealRegistrationTokenSwap>(
    key: DealKey,
    defaultData?: IDealRegistrationTokenSwap[DealKey],
  ) {
    return (
      data?: Partial<IDealRegistrationTokenSwap[DealKey]>,
    ) => {
      if (defaultData !== undefined) {
        this.deal[key] = defaultData;
      }

      // @ts-ignore Spread types may only be created from object types.ts(2698) --> works in ts 4.6.2
      this.deal[key] = { ...this.deal[key], ...data };
      return this;
    };
  }
}

export const MINIMUM_OPEN_PROPOSAL = DealDataBuilder.create().deal;

export const PARTNERED_DEAL = DealDataBuilder
  .create()
  .withProposalData({title: `${randomId}_Partnered_deal`})
  .withPartnerDaoData()
  .deal;

export const PRIVATE_PARTNERED_DEAL = DealDataBuilder
  .create()
  .withProposalData({title: `${randomId}_Private_partnered_deal`})
  .withPartnerDaoData()
  .deal;
PRIVATE_PARTNERED_DEAL.isPrivate = true;

// [Pri:1 DAI]-[Par:2 Prime, D2D]-[Vesting:No]    – http://localhost:3340/deal/feYLYPCNiK67G7DrfC8XzB

/**
 * Primary DAO Tokens: 1 - DAI
 * Partner DAO Tokens: 1 - PRIME ; 2 - D2D
 *
 * |     | Pri Tokens (Amount) | Part Tokens (Amount) | Instant | Vesting amount | Vested For | Cliff Of |
 * | --- | ------------------- | -------------------- | ------- | -------------- | ---------- | -------- |
 * | 1   | 1 (1k)              | 2 (1k; 1k)           | 100%    | 0              | 0          | 0        |
 * | 2   | 1 (1k)              | 2 (1k; 1k)           | 100%    | 0              | 1d         | 0.5d     |
 * | 3   | 1 (1k)              | 1 (1k)               | 100%    | 0              | 0          | 0        |
 * | 4   | 1 (1k)              | 1 (1k)               | 50%     | 50%            | 0          | 0        |
 */

type TokenAndAmount = [AvailableTokenNames, number]
type Percentage = number;
type Days = number;
type FundingDealsPermutations = [number, TokenAndAmount[], TokenAndAmount[], Percentage, Percentage, Days, Days]

const fundingDealsPermutations: FundingDealsPermutations[] = [
  //[Id, [[Pri ]]      , [[Part ]]                    , Inst, Vest, VFor, COf ]
  [1   , [["DAI",1000]], [["PRIME",1000],["D2D",1000]], 1   , 0   , 0   , 0 ] ,
  [2   , [["DAI",1000]], [["PRIME",1000],["D2D",1000]], 1   , 0   , 1   , 0.5 ] ,
  [3   , [["DAI",1000]], [["PRIME",1000],["D2D",1000]], 1   , 0   , 0   , 0 ] ,
  [4   , [["DAI",1000]], [["PRIME",1000],["D2D",1000]], 0.5 , 50  , 0   , 0 ] ,
];

function createTestDealsForFunding(fundingDealsPermutations: FundingDealsPermutations[]) {
  const deals = fundingDealsPermutations.map(permutation => {
    const [id, rawPrimaryDaoTokens, rawPartnerDaoTokens, instantAmount, vestingAmount, vestedFor, cliffOf] = permutation;

    // 1. Init Deal builder
    const BARTU_DEAL_BUILDER = DealDataBuilder.create();

    // 2. Proposal title
    const finalTitle = `[${id}] Isnt:${instantAmount} - VFor:${vestedFor} - COf:${cliffOf}`;
    BARTU_DEAL_BUILDER.withProposalData({title: finalTitle});

    // 3. Primary DAO Tokens
    const primaryDaoTokens = rawPrimaryDaoTokens.map(([tokenName, tokenAmount]) => {
      const { token } = TokenBuilder.create(tokenName);
      const amountNumber = (tokenAmount * token.decimals);
      token.amount = amountNumber.toString();
      token.instantTransferAmount = (amountNumber * instantAmount).toString();
      token.vestedTransferAmount = (amountNumber * vestingAmount).toString();
      token.vestedFor = vestedFor;
      token.cliffOf = cliffOf;
      return token;
    });
    const primaryDaoName = primaryDaoTokens.map(token => token.symbol).join(", ");
    BARTU_DEAL_BUILDER
      .withPrimaryDaoData({name: primaryDaoName, tokens: primaryDaoTokens});

    // 4. Partner DAO Tokens
    const partnerDaoTokens = rawPartnerDaoTokens.map(([tokenName, tokenAmount]) => {
      const { token } = TokenBuilder.create(tokenName);
      token.amount = (tokenAmount * token.decimals).toString();
      return token;
    });
    const partnerDaoName = partnerDaoTokens.map(token => token.symbol).join(", ");
    BARTU_DEAL_BUILDER
      .withPartnerDaoData({name: partnerDaoName, tokens: partnerDaoTokens});

    return BARTU_DEAL_BUILDER.deal;
  });

  return deals;
}

const deals = createTestDealsForFunding(fundingDealsPermutations);
/* prettier-ignore */ console.log("TCL ~ file: dealFixtures.ts ~ line 242 ~ deals", deals);
