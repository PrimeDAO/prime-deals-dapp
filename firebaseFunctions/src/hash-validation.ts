import { Blob } from "buffer";
import { ethers } from "ethers";
import * as functions from "firebase-functions";

/**
 * v1.1.1
 * 1. https://rinkeby.etherscan.io/address/0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C#readProxyContract
 * 2. then expand "VERSION"
 */
// const OLD_SAFE_CONTRACT_VERSION = "1.1.1"
/**
 * v1.3.0
 * 1. https://rinkeby.etherscan.io/address/0x40597Caffbc904396DCAFD23786A0e1626E6975c#code=
 * 2. "Similar Match Source Code"
 * 2.1 https://rinkeby.etherscan.io/address/0x4cb09344de5bccd45f045c5defa0e0452869ff0f#readProxyContract
 * 3. then expand "VERSION"
 */
const NEW_SAFE_CONTRACT_VERSION = "1.3.0";

const ProviderEndpoints = {
  "mainnet": `https://${process.env.RIVET_ID}.eth.rpc.rivet.cloud/`,
  "rinkeby": `https://${process.env.RIVET_ID}.rinkeby.rpc.rivet.cloud/`,
  "kovan": `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
};

/**
 * Part of the answer in
 * https://stackoverflow.com/questions/71866879/how-to-verify-message-in-wallet-connect-with-ethers-primarily-on-ambire-wallet
 */
export function encryptForGnosis(rawMessage: string): string {
  const rawMessageLength = new Blob([rawMessage]).size;
  const message = ethers.utils.toUtf8Bytes(
    "\x19Ethereum Signed Message:\n" + rawMessageLength + rawMessage,
  );
  const messageHash = ethers.utils.keccak256(message);
  return messageHash;
}

/**
 * Deals is a Safe App (https://docs.gnosis-safe.io/build-with-safe/sdks/safe-apps/get-started),
 * that requires different way of verifying a transaction (EIP-1271)
 */
export async function verifyEIP1271Signature(signerAddr: string, rawMessage: string, network: string): Promise<boolean> {
  functions.logger.info("Provider endpoint", ProviderEndpoints[network]);
  const provider = ethers.getDefaultProvider(ProviderEndpoints[network]);

  // Smart contract wallet (EIP 1271) verification: see https://eips.ethereum.org/EIPS/eip-1271 for more info
  const EIP1271ABI = [
    "function VERSION() external returns (string)",
    "function isValidSignature(bytes calldata _data, bytes calldata _signature) external returns (bytes4)", // string public constant VERSION = "1.1.1";
    "function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)",
  ];

  const signerEIP1271Contract = new ethers.Contract(signerAddr, EIP1271ABI, provider);

  const messageHash = encryptForGnosis(rawMessage);
  let version;
  try {
    version = await signerEIP1271Contract.callStatic.VERSION();
    functions.logger.info("Contract version", version);

    let verified;
    if (version === NEW_SAFE_CONTRACT_VERSION) {
      const returnValue = await signerEIP1271Contract.callStatic["isValidSignature(bytes32,bytes)"](messageHash, "0x");
      const EIP1271MagicValue = "0x1626ba7e";
      verified = EIP1271MagicValue === (returnValue);
    } else {
      const returnValue = await signerEIP1271Contract.callStatic["isValidSignature(bytes,bytes)"](messageHash, "0x");
      const EIP1271MagicValue = "0x20c13b0b";
      verified = EIP1271MagicValue === (returnValue);
    }

    return verified;
  } catch (error) {
    functions.logger.error("[Validation] " + error.message);
    throw error;
  }
}

// const ADDRESSE_OLD_PROXY = "0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C";
// const ADDRESSE_NEW_PROXY = "0x40597Caffbc904396DCAFD23786A0e1626E6975c";
// const rawMessage = "Authenticate access to Prime Deals at Wed Jun 01 2022 10:24:32 GMT+0200 (Central European Summer Time)";

// verifyEIP1271Signature(ADDRESSE_OLD_PROXY, rawMessage, "rinkeby").then(console.log);
// verifyEIP1271Signature(ADDRESSE_NEW_PROXY, rawMessage, "rinkeby").then(console.log);
