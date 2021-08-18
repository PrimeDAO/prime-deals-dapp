import { autoinject, computedFrom } from "aurelia-framework";
import { BaseStage } from "registry-wizard/baseStage";
import { Router } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";
import { EthereumService } from "../services/EthereumService";
// import { Utils } from "services/utils";
// import { BigNumber } from "ethers";

@autoinject
export class Stage4 extends BaseStage {
  private submitted = false;

  constructor(
    router: Router,
    eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
  ) {
    super(router, eventAggregator);
  }

  async submit(): Promise<void> {
    /**
     * Since this is the last stage and we are apparently valid,
     * then we have to confirm the other stages before moving on.
     */
    for (let i = 1; i < this.stageNumber; ++i) {
      if (!this.stageStates[i].verified) {
        this.validationError(`Please review step ${i} - ${this.stageStates[i].title}`);
        return;
      }
    }
    // apparently all are valid, so proceed
    this.next();
  } // else we are not valid. Don't proceed.

  @computedFrom("ethereumService.defaultAccountAddress")
  get connected(): boolean { return !!this.ethereumService.defaultAccountAddress;}

  connect(): void {
    this.ethereumService.ensureConnected();
  }
}
