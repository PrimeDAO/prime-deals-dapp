export const DEALS_TOKEN_SWAP_COLLECTION = "deals-token-swap";
export const DEALS_TOKEN_SWAP_UPDATES_COLLECTION = "deals-token-swap-updates";
export const FIREBASE_MESSAGE_TO_SIGN = "Authenticate access to Prime Deals at";

export interface IFirebaseDocument<T = any> {
  id: string;
  data: T;
}
