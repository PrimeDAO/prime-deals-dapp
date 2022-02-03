import * as LitJsSdk from "lit-js-sdk";
import { CeramicApi } from "@ceramicnetwork/common";
import { CeramicService } from "./ceramic-backend/ceramic-core";
import { Integration } from "lit-ceramic-sdk";

const STREAM_ID = "kjzl6cwe1jw14b1pqb9k16eioymrcmrxeo04fihvf1zfrv6hxz3tru9ttf4i304";

// import { toString as uint8ArrayToString } from "uint8arrays/to-string";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    ceramic?: CeramicApi;
    [index: string]: any;
    litNodeClient: any;
  }
}

/**
 * This function encodes into base 64.
 * it's useful for storing symkeys and files in ceramic
 * @param {Uint8Array} input a file or any data
 * @returns {string} returns a string of b64
 */
export function encodeb64(uintarray: any) {
  const b64 = Buffer.from(uintarray).toString("base64");
  return b64;
}

/**
 * This function converts blobs to base 64.
 * for easier storage in ceramic
 * @param {Blob} blob what you'd like to encode
 * @returns {Promise<String>} returns a string of b64
 */
function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(
        // @ts-ignore
        reader.result.replace("data:application/octet-stream;base64,", ""),
      );
    reader.readAsDataURL(blob);
  });
}

/**
 * This function decodes from base 64.
 * it's useful for decrypting symkeys and files in ceramic
 * @param {blob} input a b64 string
 * @returns {string} returns the data as a string
 */
export function decodeb64(b64String: any) {
  return new Uint8Array(Buffer.from(b64String, "base64"));
}

/**
 * encrypts a message with Lit returns required details
 * this obfuscates data such that it can be stored on ceramic without
 * non-permissioned eyes seeing what the data is
 * @param {blob} auth authentication from wallet
 * @param {String} aStringThatYouWishToEncrypt the clear text you'd like encrypted
 * @returns {Promise<Array<any>>} returns, in this order: encryptedZipBase64, encryptedSymmetricKeyBase64, accessControlConditions, chain
 */
export async function _encryptWithLit(
  auth: any[],
  aStringThatYouWishToEncrypt: string,
  accessControlConditions: Array<Record<string, unknown>>,
): Promise<Array<any>> {
  const chain = "ethereum";
  const authSig = await LitJsSdk.checkAndSignAuthMessage({
    chain: chain,
  });
  const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
    aStringThatYouWishToEncrypt,
  );

  const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
    accessControlConditions,
    symmetricKey,
    authSig: authSig,
    chain,
  });

  const encryptedZipBase64 = await blobToBase64(encryptedZip);
  const encryptedSymmetricKeyBase64 = encodeb64(encryptedSymmetricKey);

  return [
    encryptedZipBase64,
    encryptedSymmetricKeyBase64,
    accessControlConditions,
    chain,
  ];
}

export class CeramicServicePlayground {
  value = "ceramicServicePlayground";

  /**
 * Starts Lit Client in background. should be run upon starting of project.
 *
 * @param {Window} window the window of the project, to which it attaches
 * a litNodeClient
 */
  async initLitClient(window: Window) {
    console.log("Starting Lit Client...");
    const litCeramicIntegration = new Integration();
    await litCeramicIntegration.startLitClient(window);
    // const client = new LitJsSdk.LitNodeClient();
    // client.connect();
    // window.litNodeClient = client;

    return litCeramicIntegration;
  }

  async attached(): Promise<void> {
    const litCeramic = await this.initLitClient(window);
    // litCeramic.encryptAndWrite(toEncrypt, accessControlConditions)
    const response = await litCeramic.readAndDecrypt(STREAM_ID);
    console.log("TCL: CeramicServicePlayground -> response", response);

    // const ceramicService = await CeramicService.create();
    // ceramicService.createAndEncrypt();

    // const authSig = await LitJsSdk.checkAndSignAuthMessage({
    //   chain: "ethereum",
    // });

    // console.log("TCL: CeramicServicePlayground -> authSig", authSig);
  }

}
