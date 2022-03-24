import { autoinject, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EthereumService } from "services/EthereumService";
import { DiscussionsService } from "DealDashboard/discussionsService";
import { IClause } from "entities/DealRegistrationTokenSwap";
import "./dealClauses.scss";

@autoinject
export class DealClauses {
  @bindable deal: DealTokenSwap;
  @bindable.booleanAttr authorized = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;

  private clauses: IClause[];

  constructor(
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
  ) {
  }

  attached(): void {
    this.clauses = this.deal.registrationData.terms.clauses;
  }

  /**
   * Adds a new discussion thread to the deal
   * (Currently saves the thread to the local storage- this should be replaced with a data-storage call)
   *
   * @param topic the discussion topic
   * @param id the id of the clause the discussion is for or null if it is a general discussion
   */
  private async addOrReadDiscussion(topic: string, discussionHash: string, clauseHash: string | null, clauseIndex: number | null): Promise<void> {
    this.discussionId = discussionHash || // If no discussion hash provided- create a new discussion
      await this.discussionsService.createDiscussion(
        this.deal.id,
        {
          topic,
          clauseHash,
          clauseIndex,
          admins: [this.ethereumService.defaultAccountAddress],
          representatives: [{address: this.ethereumService.defaultAccountAddress}],
          isPublic: true,
        },
      );
  }

  authorizedChanged(): void {
    if (this.ethereumService.defaultAccountAddress) {
      this.discussionsService.setEnsName(this.ethereumService.defaultAccountAddress);
    }
  }
}
