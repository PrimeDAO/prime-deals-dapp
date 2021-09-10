import { autoinject } from "aurelia-framework";
import { Hash } from "services/EthereumService";
import axios from "axios";
import { ConsoleLogService } from "services/ConsoleLogService";
import { IDealConfig } from "../registry-wizard/dealConfig";
import { Address, EthereumService, Networks } from "services/EthereumService";

const CID = require("cids");

export interface IIpfsClient {
  pinHash(hash: Hash, name?: string): Promise<void>;
  addAndPinData(data: string, name?: string): Promise<Hash>;
}

// export interface IDealProposalParams {
//   title: string;
//   url ?: string;
//   description: string;
//   tags ?: string[];
// }

@autoinject
export class IpfsService {

  constructor(
    private ethereumService: EthereumService,
    private consoleLogService: ConsoleLogService) {}

  /**
   * must be initialize externally prior to using the service
   */
  private ipfs: IIpfsClient;
  private accountAddress: Address = null;

  public initialize(ipfs: IIpfsClient): void {
    this.ipfs = ipfs;
  }

  /**
 * save deal proposal to IPFS, return the IPFS hash
 * @param  options an Object to save. This object must have version, proposal, daos, admins and terms defined
 * @return  a Promise that resolves in the IPFS Hash where the file is saved
 */
  public saveDealProposal(options: IDealConfig): Promise<Hash> {
    let ipfsDataToSave = {};
    this.accountAddress = this.ethereumService.defaultAccountAddress || null;

    if (options.version && options.proposal && options.daos.length && options.admins.length && options.terms) {
      ipfsDataToSave = {
        version: options.version,
        proposal: options.proposal,
        daos: options.daos,
        admins: options.admins,
        terms: options.terms,
        createdAt: new Date().toISOString(),
        alteredAt: new Date().toISOString(),
        creatorAddress: this.accountAddress,
        uninitialized: false,
        hasNotStarted: true,
        incomplete: false,
        isClosed: false,
        isPaused: false,
      };
    }
    return this.ipfs.addAndPinData(JSON.stringify(ipfsDataToSave), options.proposal.name);
  }

  /**
   * fetches JSON data given hash, converts to an object
   * @param hash
   * @returns
   */
  public async getDealProposal(hash: string) : Promise<IDealConfig> {
    try {
      const response = await axios.get(this.getIpfsUrl(hash));

      if (response.status !== 200) {
        throw Error(`An error occurred getting the hash ${hash}: ${response.statusText}`);
      } else {
        return JSON.parse(response.data);
      }
    } catch (ex) {
      this.consoleLogService.logMessage(ex.message, "warning");
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

  public async getPinnedObjectsHashes(): Promise<Array<Hash>> {
    try {
      const response = await axios.get(
        "https://api.pinata.cloud/data/pinList",
        {
          headers: {
            pinata_api_key: process.env.PINATA_API_KEY_TEST,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY_TEST,
          },
        },
      );

      if (response.status !== 200) {
        throw Error("An error occurred getting the pinned jobs");
      } else {
        if (response.data.length === 0) return [];

        const pinnedObjects = response.data.rows
          .filter((pin: any) => pin.date_pinned !== null && pin.date_unpinned === null );
        return pinnedObjects.map((pin: any) => pin.ipfs_pin_hash);
      }
    } catch (ex) {
      this.consoleLogService.logMessage(ex.message, "warning");
      return null;
    }
  }

  /**
   * url to use to request content from IPFS
   * @param hash
   * @returns
   */
  public getIpfsUrl(hash: string, protocol = "ipfs"): string {
    const format = process.env.IPFS_GATEWAY;
    const encodedHash = (protocol === "ipfs") ? new CID(hash).toV1().toBaseEncodedString("base32") : hash;
    return format.replace("${hash}", encodedHash).replace("${protocol}", protocol);
  }
}
