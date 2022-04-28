// @ts-check
import * as fs from "fs";
import * as path from "path";
import { AvailableTokenNames, TokenBuilder } from "../cypress/fixtures/bulders/TokenBuilder";
import { DealDataBuilder } from "../cypress/fixtures/dealFixtures";
import * as FundingDealsPermutationsJson from "../cypress/fixtures/fundingDealsPermutations.json";

type TokenAndAmount = [AvailableTokenNames, number]
type Percentage = number;
type Days = number;
export type FundingDealsPermutations = [number, Array<TokenAndAmount>, Array<TokenAndAmount>, Percentage, Percentage, Days, Days]

export function convertPermutationsToDealData(fundingDealsPermutations: Array<FundingDealsPermutations>) {
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
      token.amount = `${tokenAmount}${"0".repeat(token.decimals)}`;
      token.instantTransferAmount = `${tokenAmount * instantAmount}${"0".repeat(token.decimals)}`;
      token.vestedTransferAmount = `${tokenAmount * vestingAmount}${"0".repeat(token.decimals)}`;
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
      token.amount = `${tokenAmount}${"0".repeat(token.decimals)}`;
      token.instantTransferAmount = `${tokenAmount * instantAmount}${"0".repeat(token.decimals)}`;
      token.vestedTransferAmount = `${tokenAmount * vestingAmount}${"0".repeat(token.decimals)}`;
      token.vestedFor = vestedFor;
      token.cliffOf = cliffOf;
      return token;
    });
    const partnerDaoName = partnerDaoTokens.map(token => token.symbol).join(", ");
    BARTU_DEAL_BUILDER
      .withPartnerDaoData({name: partnerDaoName, tokens: partnerDaoTokens});

    return BARTU_DEAL_BUILDER.deal;
  });

  return deals;
}

function generateJsonFromPermutations(destinationPath: string) {
  const permutationJson = FundingDealsPermutationsJson as Array<FundingDealsPermutations>;
  const dealData = convertPermutationsToDealData(permutationJson);

  const resultJson = JSON.stringify(dealData, null, 4);
  fs.writeFileSync(destinationPath, resultJson);
}

const root = path.resolve(__dirname, "..");
const destinationPath = `${root}/test/data/dealFixturesFunding.json`;
generateJsonFromPermutations(destinationPath);
