import { IToken } from "entities/DealRegistrationTokenSwap";

const DAI_TOKEN = {
  address: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
  amount: "",
  cliffOf: 0,
  decimals: 18,
  instantTransferAmount: "",
  logoURI: "https://primedao.mypinata.cloud/ipfs/QmVChZZtAijsiTnMRFb6ziQLnRocXnBU2Lb3F67K2ZPHho",
  name: "Dai Stablecoin",
  symbol: "DAI",
  vestedFor: 0,
  vestedTransferAmount: "0",
};

const PRIME_TOKEN = {
  address: "0x80E1B5fF7dAdf3FeE78F60D69eF1058FD979ca64",
  amount: "",
  cliffOf: 0,
  decimals: 18,
  instantTransferAmount: "",
  logoURI: "https://static.coincost.net/logo/cryptocurrency/primedao.png",
  name: "PrimeDAO Token",
  symbol: "PRIME",
  vestedFor: 0,
  vestedTransferAmount: "0",
};

const D2D_TOKEN = {
  address: "0xF70d807A0828d2498fa01246c88bA5BaCd70889b",
  amount: "",
  cliffOf: 0,
  decimals: 18,
  instantTransferAmount: "",
  logoURI: "https://raw.githubusercontent.com/PrimeDAO/tokenlists/main/logos/D2D.png",
  name: "Prime",
  symbol: "D2D",
  vestedFor: 0,
  vestedTransferAmount: "0",
};

const WETH_TOKEN = {
  address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  amount: "",
  cliffOf: 0,
  decimals: 18,
  instantTransferAmount: "",
  logoURI: "https://raw.githubusercontent.com/PrimeDAO/tokenlists/main/logos/weth.png",
  name: "Wrapped Ether",
  symbol: "WETH",
  vestedFor: 0,
  vestedTransferAmount: "0",
};

type AvailableTokenNames = "DAI" | "PRIME" | "D2D" | "WETH"

const tokenMap = {
  /** 0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa */
  "DAI": DAI_TOKEN,
  /** 0x80E1B5fF7dAdf3FeE78F60D69eF1058FD979ca64 */
  "PRIME": PRIME_TOKEN,
  /** 0xF70d807A0828d2498fa01246c88bA5BaCd70889b */
  "D2D": D2D_TOKEN,
  /** 0xc778417E063141139Fce010982780140Aa0cD5Ab */
  "WETH": WETH_TOKEN,
};

export class TokenBuilder {
  public token: IToken = {
    address: "",
    amount: "",
    cliffOf: 0,
    decimals: 18,
    instantTransferAmount: "",
    logoURI: "",
    name: "",
    symbol: "",
    vestedFor: 0,
    vestedTransferAmount: "",
  };

  constructor(token?: IToken) {
    if (!token) return;

    this.token = token;
  }

  public static create(name?: AvailableTokenNames) {
    if (!name) return new TokenBuilder();

    const token = tokenMap[name];
    if (!token) throw new Error("Token not supported");

    return new TokenBuilder(token);
  }

  public withAllInstant(amount: string) {
    this.token.amount = amount;
    this.token.instantTransferAmount = amount;

    return this;
  }
}
