import { bindable } from "aurelia-typed-observable-plugin";
import "./proposalLeadSection.scss";
import { EthereumService } from "../../../services/EthereumService";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { IProposalLead } from "../../../entities/Deal";

@autoinject
export class ProposalLeadSection {
  @bindable errors: Record<string, string> = {};
  @bindable data: IProposalLead;
  @bindable disabled = false;

  address?: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
  ) {
    this.address = this.ethereumService.defaultAccountAddress;
    this.eventAggregator.subscribe("Network.Changed.Account", address => this.address = address);
  }

  async connectToWallet() {
    await this.ethereumService.connect();
  }
}
