import { DealTokenSwap } from "entities/DealTokenSwap";
import { IEthereumService } from "services/EthereumService";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { bindable, BindingMode } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";

export class DealClauses {
  @bindable deal: DealTokenSwap;
  @bindable({set: toBoolean, type: Boolean}) authorized = false;
  @bindable({mode: BindingMode.twoWay}) discussionId?: string;

  private get clauses(): IClause[] {
    return this.deal.registrationData.terms.clauses;
  }

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    private discussionsService: DiscussionsService,
  ) {
  }

  /**
   * Adds a new discussion thread to the deal
   * (Currently saves the thread to the local storage- this should be replaced with a data-storage call)
   *
   * @param topic the discussion topic
   * @param id the id of the clause the discussion is for or null if it is a general discussion
   */
  private async addOrReadDiscussion(topic: string, clauseId: string | null): Promise<void> {
    if (this.discussionsService.discussions[clauseId]) {
      this.discussionId = clauseId;
    } else {
      // If no discussion hash provided- create a new discussion
      this.discussionId = await this.discussionsService.createDiscussion(
        this.deal,
        {
          topic,
          discussionId: clauseId,
          isPublic: !this.deal.isPrivate,
        },
      );
    }
    this.discussionsService.autoScrollAfter(0);
  }

  authorizedChanged(): void {
    if (this.ethereumService.defaultAccountAddress) {
      this.discussionsService.setEnsName(this.ethereumService.defaultAccountAddress);
    }
  }
}
