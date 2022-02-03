import { Ceramic } from "@ceramicnetwork/core";
import {create} from "ipfs-core";
import dagJose from "dag-jose";
import { convert } from "blockcodec-to-ipld-format";
import KeyDidResolver from "key-did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { DID } from "dids";

async function init() {
  const dagJoseFormat = convert(dagJose);
  const ipfs = await create({ ipld: { formats: [dagJoseFormat] } });
  const ceramic = await Ceramic.create(ipfs, {});
  const resolver = {
    ...KeyDidResolver.getResolver(),
    // @ts-ignore
    ...ThreeIdResolver.getResolver(ceramic),
  };
  const did = new DID({ resolver });
  ceramic.did = did;

}

init();
