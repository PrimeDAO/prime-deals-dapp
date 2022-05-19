import axios from "axios";
import { ConsoleLogService } from "./ConsoleLogService";
import { inject } from "aurelia";
import { Hash } from "./EthereumService";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CID = require("cids");

export interface IIpfsClient {
  pinHash(hash: Hash, name?: string): Promise<void>;
  addAndPinData(data: string, name?: string): Promise<Hash>;
  getPinnedObjectsHashes(): Promise<Array<Hash>>;
}

@inject()
export class IpfsService {

  /**
   * must be initialize externally prior to using the service
   */
  private ipfs: IIpfsClient;

  constructor(private consoleLogService: ConsoleLogService) {}

  public initialize(ipfs: IIpfsClient): void {
    this.ipfs = ipfs;
  }

  /**
   * fetches JSON data given hash, converts to an object
   * @param hash
   * @param protocol -- ipfs or ipns
   * @returns
   */
  public async getObjectFromHash(hash: Hash, protocol = "ipfs") : Promise<any> {
    let url = "n/a";
    try {
      url = this.getIpfsUrl(hash, protocol);
      const response = await axios.get(url);

      if (response.status !== 200) {
        throw Error(`An error occurred getting the hash ${hash}: ${response.statusText}`);
      } else {
        return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
      }
    } catch (ex) {
      this.consoleLogService.logMessage(`Error fetching from ${url}: ${ex.message}`, "error");
      return null;
    }
  }

  /**
   * saves and pin the given data
   * @param str
   * @returns the resulting hash
   */
  public async saveString(str: string, name?: string): Promise<Hash> {
    return this.ipfs.addAndPinData(str, name);
  }

  /**
   * url to use to request content from IPFS
   * @param hash
   * @returns
   */
  public getIpfsUrl(hash: string, protocol= "ipfs"): string {
    const format = process.env.IPFS_GATEWAY;
    const encodedHash = (protocol === "ipfs") ? new CID(hash).toV1().toBaseEncodedString("base32") : hash;
    return format.replace("${hash}", encodedHash).replace("${protocol}", protocol);
  }

  public async getPinnedObjectsHashes(): Promise<Array<Hash>> {
    return this.ipfs.getPinnedObjectsHashes();
  }
}
