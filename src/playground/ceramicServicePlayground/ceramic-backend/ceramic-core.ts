// const { writeFile } = require('fs');
import { CeramicClient } from "@ceramicnetwork/http-client";
import { CeramicApi } from "@ceramicnetwork/common";
import { TileLoader } from "@glazed/tile-loader";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

/**
 * _id: 'did:key:z6MkttSREpBqiPj3XZC8G5c3D3GPwnJGyhdBTqusopaZVJPV' } },
 */
const SEED = "c1a852c5cb04da1af73dd5a1d8208447c509f48d0d6a3462732c6340a9cbef61";
const STREAM_ID = "kjzl6cwe1jw14b1pqb9k16eioymrcmrxeo04fihvf1zfrv6hxz3tru9ttf4i304";

export class CeramicService {
  constructor(public ceramicClient: CeramicApi) { }

  static async create(seed = SEED) {
    const key = fromString(seed, "base16");
    // Create and authenticate the DID
    const did = new DID({
      provider: new Ed25519Provider(key),
      resolver: getResolver(),
    });
    await did.authenticate();

    // Connect to the local Ceramic node
    const ceramicClient = new CeramicClient("http://localhost:7007");
    ceramicClient.setDID(did);

    /**
     * 1. Hello, this is didId: did:key:z6MkttSREpBqiPj3XZC8G5c3D3GPwnJGyhdBTqusopaZVJPV
     */
    console.log(`1. Hello, this is didId: ${did.id}`);

    return new CeramicService(ceramicClient as unknown as CeramicApi);
  }

  async createAndEncrypt(seed = SEED): Promise<void> {
    console.log(seed);
  }

  public async loadTile(streamId: string = STREAM_ID) {
    const loader = new TileLoader({ ceramic: this.ceramicClient });

    const [stream1] = await Promise.all([
      loader.load(streamId),
    ]);

    console.log("2. Loaded Tile id: ", stream1.id);

    return stream1;
  }

  public async createTile() {
    const loader = new TileLoader({ ceramic: this.ceramicClient });

    console.log("2.1 Creating a Tile with following content:");
    const payload = { create: "time" };
    console.log("2.2 ", payload);

    const createdStream = await loader.create(payload);
    /**
     * 2.3 Created id:  StreamID(kjzl6cwe1jw146895vajuraojk7e3ddxcyf2ihhy6n6dlzqjkntyr7ox6v0kqgz)
     */
    console.log("2.3 Created id: ", createdStream.id);

    return createdStream;
  }

  public async updateTile(streamId: string, content: Record<string, string>) {
    const targetTile = await this.loadTile(streamId);
    console.log("3.1 Updating tile: ", targetTile.id);
    console.log("3.2 Content before: ", targetTile.content);

    targetTile.update(content);
  }

}

// The key must be provided as an environment variable
// async function getManager() {
//   const ceramic = await getCeramic()

//   // Create a manager for the model
//   // @ts-ignore
//   const manager = new ModelManager(ceramic)
//   return manager
// }

export async function run(seed: string) {
  const ceramicService = await CeramicService.create(seed);
  /** Create */
  // const created = await ceramicService.createTile()

  const streamId = "kjzl6cwe1jw146895vajuraojk7e3ddxcyf2ihhy6n6dlzqjkntyr7ox6v0kqgz";

  /** Load */
  // const targetTile = await ceramicService.loadTile(streamId)
  // console.log('TCL: run -> targetTile.content', targetTile.content)

  /** Update */
  const content = { update: "time4-other" };
  await ceramicService.updateTile(streamId, content);

  /** Takes ~2secs to get update life */
  setTimeout(async () => {
    const updated = await ceramicService.loadTile(streamId);
    console.log("TCL: run -> updated", updated.content);
  }, 2000);

  // const updated = await ceramicService.loadTile(streamId)
  // console.log('TCL: run -> updated', updated.content)
}

// const seedMain = SEED;
// /**
//  * ✔ Created DID did:key:z6MkrzFWP68y3EFQaYqqp59CCSKhnSZKRXW8kYUmvt1KY3HF
//  * with seed bcd78618801c15462b858f19e1e27bbc1a1edb015b3b027663f6e8929103add8
//  */
// const seedOther = "bcd78618801c15462b858f19e1e27bbc1a1edb015b3b027663f6e8929103add8";
// run(seedOther);
