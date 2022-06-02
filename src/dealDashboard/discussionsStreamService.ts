import { Realtime } from "ably/promises";
import { Types } from "ably";
import { EthereumService } from "services/EthereumService";
import { IEventAggregator, inject } from "aurelia";

export { Types };

export const COMMENTS_STREAM_UPDATED = "commentsStreamUpdated";

@inject()
export class DiscussionsStreamService {
  private discussionCommentsStream: Types.RealtimeChannelPromise;

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) { }

  /**
   * Convert ably streams into Aurelia's Event Aggregators.
   * This allows us to listen to changes throughout the app,
   * as stream publishing is now plain old event publishing.
   */
  public async initStreamPublishing(discussionId: string): Promise<void> {
    const channelName = `${discussionId}:${EthereumService.targetedChainId}`;

    const ably = new Realtime.Promise({ authUrl: `${process.env.CONVO_API_NODE}/getAblyAuth?apikey=${process.env.CONVO_API_KEY}` });
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
