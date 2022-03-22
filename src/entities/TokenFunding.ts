import { BigNumber } from "ethers";
import { IToken } from "./DealRegistrationTokenSwap";

export interface ITokenFunding extends IToken {
  target?: BigNumber,
  deposited?: BigNumber,
  required?: BigNumber,
  percentCompleted?: number
}
