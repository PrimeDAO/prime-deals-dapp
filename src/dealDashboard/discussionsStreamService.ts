import { Realtime } from "ably/promises";
import { Types } from "ably";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";

export { Types };

export const COMMENTS_STREAM_UPDATED = "commentsStreamUpdated";

/**
 * TODO: Should define a new place for this type, and all other `Address` imports should take it from there
 * Cause for change: Want to import app code into Cypress code (, because we want to use the acutal code we are testing).
 * Reason: The other dependencies in `EthereumService` got pulled into Cypress webpack build as well.
 *   And the current Cypress webpack does not support, eg. scss files bundling and processing
 */
export type AllowedNetworks = "mainnet" | "kovan" | "rinkeby";
export enum Networks {
  Mainnet = "mainnet",
  Rinkeby = "rinkeby",
  Kovan = "kovan",
}

@autoinject
export class DiscussionsStreamService {
  private discussionCommentsStream: Types.RealtimeChannelPromise;

  constructor(
    private eventAggregator: EventAggregator,
  ) { }

  public getNetworkId(network: AllowedNetworks): number {
    if (network === Networks.Mainnet) return 1;
    if (network === Networks.Rinkeby) return 4;
    if (network === Networks.Kovan) return 42;
  }

  public async subscribeToDiscussion(discussionId: string): Promise<void> {
    const channelName = `${discussionId}:${this.getNetworkId(process.env.NETWORK as AllowedNetworks)}`;

    // const convo = new Convo(process.env.CONVO_API_KEY);
    // const res = convo.threads.subscribe(channelName, this.updateThread);
    // console.log({res});

    const ably = new Realtime.Promise({ authUrl: `https://theconvo.space/api/getAblyAuth?apikey=${ process.env.CONVO_API_KEY }` });
    this.discussionCommentsStream = await ably.channels.get(channelName);
    // this.discussionCommentsStream.subscribe((comment: Types.Message) => this.updateCommentsThreadUponMessageArrival(comment));
    this.discussionCommentsStream.subscribe((commentStreamMessage: Types.Message) => {
      this.eventAggregator.publish(COMMENTS_STREAM_UPDATED, commentStreamMessage);
    });
  }

  public unsubscribeFromDiscussion(): void {
    if (this.discussionCommentsStream) {
      this.discussionCommentsStream.unsubscribe();
    }
  }
}
