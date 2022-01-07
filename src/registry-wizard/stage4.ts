import { DealService } from "services/DealService";
import { autoinject, computedFrom } from "aurelia-framework";
import { BaseStage } from "registry-wizard/baseStage";
import { Router } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";
import { EthereumService, Hash } from "../services/EthereumService";
import { IpfsService } from "services/IpfsService";
import { IDealConfig } from "registry-wizard/dealConfig";
// import { Utils } from "services/utils";
// import { BigNumber } from "ethers";

@autoinject
export class Stage4 extends BaseStage {
  private submitted = false;

  constructor(
    router: Router,
    eventAggregator: EventAggregator,
    dealService: DealService,
    private ethereumService: EthereumService,
    private ipfsService: IpfsService,
  ) {
    super(dealService, router, eventAggregator );
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

    const hash = await this.saveDealProposal(this.dealConfig);
    console.log(`Saved to IPFS ${hash}`);
    this.next();
  } // else we are not valid. Don't proceed.

  @computedFrom("ethereumService.defaultAccountAddress")
  get connected(): boolean { return !!this.ethereumService.defaultAccountAddress;}

  connect(): void {
    this.ethereumService.ensureConnected();
  }

  /**
 * save deal proposal to IPFS, return the IPFS hash
 * @param  options an Object to save. This object must have version, proposal, daos, admins and terms defined
 * @return  a Promise that resolves in the IPFS Hash where the file is saved
 */
  private saveDealProposal(options: IDealConfig): Promise<Hash> {
    let ipfsDataToSave = {};

    if (options.version && options.proposal && options.daos.length && options.admins.length && options.terms) {
      ipfsDataToSave = {
        version: options.version,
        proposal: options.proposal,
        daos: options.daos,
        admins: options.admins,
        terms: options.terms,
        createdAt: new Date().toISOString(),
        alteredAt: new Date().toISOString(),
        creatorAddress: this.ethereumService.defaultAccountAddress,
        uninitialized: false,
        hasNotStarted: true,
        incomplete: false,
        isClosed: false,
        isPaused: false,
      };
    }
    return this.ipfsService.saveString(JSON.stringify(ipfsDataToSave), options.proposal.name);
  }
}
