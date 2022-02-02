import { bindable } from "aurelia-typed-observable-plugin";
import { IProposalLead } from "entities/DealRegistrationData";
import { WizardErrors } from "services/WizardService";
import "./proposalLeadSection.scss";
import { autoinject, bindingMode } from "aurelia-framework";
import { EthereumService } from "../../../services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class ProposalLeadSection {
  @bindable errors: WizardErrors<IProposalLead>;
  @bindable({defaultBindingMode: bindingMode.twoWay}) address: string;
  @bindable({defaultBindingMode: bindingMode.twoWay}) email?: string;
  @bindable disabled = false;

  ethAddress?: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
  ) {
    this.ethAddress = this.ethereumService.defaultAccountAddress;
    this.eventAggregator.subscribe("Network.Changed.Account", address => this.ethAddress = address);
  }

  async connectToWallet() {
    await this.ethereumService.connect();
  }
}
