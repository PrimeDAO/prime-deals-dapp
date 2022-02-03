import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { IDiscussion } from "entities/DealDiscussions";
import { DateService } from "services/DateService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./discussionsList.scss";

@autoinject
export class DiscussionsList{

  dealId: string;

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  private discussionsArray: Array<IDiscussion> = [];
  private discussionsHashes: string[];
  private hasDiscussions: boolean;

  constructor(
    private router: Router,
    private dateService: DateService,
    private deal: DealTokenSwap,
  ) {}

  async attached(): Promise<void> {

    //"open_deals_stream_id_2";
    this.dealId = this.router.currentInstruction.parentInstruction.params.address;

    const discussions = await this.deal.discussions;

    this.discussionsArray = Object.keys(discussions).map(key => (
      {id: key, ...discussions[key]}
    ));

    this.hasDiscussions = !!this.discussionsArray.length;
  }

  private navigateTo(page) {
    this.router.navigate(page);
  }
}
