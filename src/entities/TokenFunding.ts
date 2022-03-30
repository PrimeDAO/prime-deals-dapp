import { BigNumber } from "ethers";
import { IToken } from "./DealRegistrationTokenSwap";

export interface ITokenFunding extends IToken {
  deposited?: BigNumber,
  required?: BigNumber,
  percentCompleted?: number
}
