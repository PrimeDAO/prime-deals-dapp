import {Address} from "services/EthereumService";

export interface IDummyDeal {
  address: Address,
  dao: {
    creator: string,
    partner?: string,
  },
  type: string,
  title: string,
  description: string,
  logo: {
    creator: string,
    partner?: string,
  },
  startsInMilliseconds: number,
  status: "hasNotStarted" | "claimingIsOpen" | "incomplete" | "uninitialized" | "contributingIsOpen" | "isPaused" | "isClosed"
}
