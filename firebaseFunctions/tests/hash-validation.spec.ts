import {
  encryptForGnosis,
  verifyEIP1271Signature,
} from "../src/hash-validation";

/******* ******* *********/
/******* Rinkeby *********/
/******* ******* *********/
const TEST_ADDRESSE_OLD_PROXY = "0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C";
const TEST_ADDRESSE_NEW_PROXY = "0x40597Caffbc904396DCAFD23786A0e1626E6975c";

const rawMessage =
  "Authenticate access to Prime Deals at Wed Jun 01 2022 10:24:32 GMT+0200 (Central European Summer Time)";

/******* ******* *********/
/******* MAINNET *********/
/******* ******* *********/
// const addr = "0x245cc372C84B3645Bf0Ffe6538620B04a217988B";
// const msg = "0x947b0255d70220bc485d20d9868ef6a8fdd4101aceeb34021863ae4b3c99b37e";
// verifyEIP1271Signature(addr, msg, "mainnet").then(console.log);

describe("EIP-1271", () => {
  describe("encryption", () => {
    it("Should encrypt correctly", () => {
      const result = encryptForGnosis(rawMessage);
      /**
       * 1. https://rinkeby.etherscan.io/tx/0x544ad4ce2662c2b2ede089c0e815fb0b08b40eac8519b31c006dbfabb8107c38
       * 2. "Click to see more"
       * 3. "Decode Input Data"
       * 4. 3rd argument: 0x85a5affe000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000205898e55e19df2268469c9ea3afd66469e79d08d94e014691b3d20c51f210a1b7
       * 4.1 check starting from the end
       */
      expect(result).toBe(
        "0x5898e55e19df2268469c9ea3afd66469e79d08d94e014691b3d20c51f210a1b7",
      );
    });
  });

  describe.skip("rinkeby", () => {
    it("verify - old proxy", async () => {
      const result = await verifyEIP1271Signature(
        TEST_ADDRESSE_OLD_PROXY,
        rawMessage,
        "rinkeby",
      );
      expect(result).toBe(true);
    });
    it("verify - new proxy", async () => {
      const result = await verifyEIP1271Signature(
        TEST_ADDRESSE_NEW_PROXY,
        rawMessage,
        "rinkeby",
      );
      expect(result).toBe(true);
    });
  });
});
