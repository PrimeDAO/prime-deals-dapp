import { BigNumber } from "ethers";
import { IDAO, IToken } from "./DealRegistrationTokenSwap";

export interface ITokenFunding extends IToken {
  target?: BigNumber,
  deposited?: BigNumber,
  required?: BigNumber,
  percentCompleted?: number
}
export interface ITransaction {
  dao: IDAO, //dao that this transaction is related to in registration data
  type: string, // deposit or withdraw
  token: IToken, //only need iconURI, amount and symbol
  address: string, //from/to address
  createdAt: Date, //transaction date
  txid: string, //transaction id,
  withdrawLink: string, //not sure if this is needed, but will need to know how they withdraw
}
