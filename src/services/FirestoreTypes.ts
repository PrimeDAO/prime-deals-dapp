export const DEALS_TOKEN_SWAP_COLLECTION = "deals-token-swap";

export interface IFirebaseDocument<T = any> {
  id: string;
  data: T;
}

export interface IDocumentUpdates<T> {
  modified: Array<T>,
  removed: Array<T>,
}
