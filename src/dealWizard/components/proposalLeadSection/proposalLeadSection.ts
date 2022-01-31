import { bindable } from "aurelia-typed-observable-plugin";
import { IProposalLead } from "entities/DealRegistrationData";
import { WizardErrors } from "services/WizardService";
import "./proposalLeadSection.scss";
import { autoinject } from "aurelia-framework";
import { EthereumService } from "../../../services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class ProposalLeadSection {
  @bindable errors: WizardErrors<IProposalLead>;
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
