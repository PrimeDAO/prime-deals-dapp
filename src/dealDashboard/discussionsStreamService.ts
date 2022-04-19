import { Realtime } from "ably/promises";
import { Types } from "ably";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";

export { Types };

export const COMMENTS_STREAM_UPDATED = "commentsStreamUpdated";

@autoinject
export class DiscussionsStreamService {
  private discussionCommentsStream: Types.RealtimeChannelPromise;

  constructor(
    private eventAggregator: EventAggregator,
  ) { }

  /**
   * Convert ably streams into Aurelia's Event Aggregators.
   * This allows us to listen to changes throughout the app,
   * as stream publishing is now plain old event publishing.
   */
  public async initStreamPublishing(discussionId: string): Promise<void> {
    const channelName = `${discussionId}:${EthereumService.targetedChainId}`;

    const ably = new Realtime.Promise({ authUrl: `https://theconvo.space/api/getAblyAuth?apikey=${ process.env.CONVO_API_KEY }` });
    this.discussionCommentsStream = await ably.channels.get(channelName);
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
