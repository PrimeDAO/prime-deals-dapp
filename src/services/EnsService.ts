import { autoinject } from "aurelia-framework";
import { getAddress } from "ethers/lib/utils";
import { Address, EthereumService } from "services/EthereumService";

@autoinject
export class EnsService {

  /**
   * cache Address => ENS
   */
  private ensCache = new Map<Address, string>();
  /**
   * cache ENS => Address
   */
  private addressCache = new Map<string, Address>();

  constructor(
    private ethereumService: EthereumService,
  ) {}

  public async getEnsForAddress(address: Address): Promise<string> {
    let ens: string;
    let isCached = false;

    if (this.ensCache.has(address)) {
      isCached = true;
      ens = this.ensCache.get(address);
    }

    if (!isCached && !ens) {
      ens = await this.ethereumService.getEnsForAddress(address);
      this.ensCache.set(address, ens);
    }
    return ens;
  }

  /**
   * Returns address that is represented by the ENS.
   * Returns null if it can't resolve the ENS to an address
   * Returns address if it already is an address, else null if ensOnly
   */
  public async getAddressForEns(ens: string, ensOnly = false): Promise<Address> {
    let address: Address;
    let isCached = false;

    if (ensOnly) {
      try {
        if (getAddress(ens)) {
          // already is an address, return null
          return null;
        }
        // eslint-disable-next-line no-empty
      } catch { }
    }

    if (this.addressCache.has(ens)) {
      isCached = true;
      address = this.addressCache.get(ens);
    }

    if (!isCached && !address) {
      address = await this.ethereumService.getAddressForEns(ens);
      this.addressCache.set(ens, address);
    }
    return address;
  }
}
