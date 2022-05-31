import { valueConverter } from "aurelia";
import { getAddress } from "ethers/lib/utils";
import { Address } from "services/EthereumService";

/**
 * Ensure that the address is a checksum address
 */
@valueConverter("checksum")
export class ChecksumAddressValueConverter {

  /**
     * When the address cannot be converted, this will return the original value.
     * This helps the user see the original mistake.  Validation will need to make sure that the
     * incorrect value is not persisted.
     * @param value
     */
  public fromView(address: Address | string): Address | string {
    try {
      return getAddress(address);
    } catch {
      return address;
    }
  }
}
