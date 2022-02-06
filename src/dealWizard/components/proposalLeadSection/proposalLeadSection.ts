import { bindable } from "aurelia-typed-observable-plugin";
import "./proposalLeadSection.scss";
import { autoinject, bindingMode } from "aurelia-framework";
import { EthereumService } from "../../../services/EthereumService";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { proposalLeadValidationRules } from "../../validation";
import { validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { PrimeRenderer } from "../../../resources/elements/primeDesignSystem/validation/renderer";

@autoinject
export class ProposalLeadSection {
  @bindable disabled = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) address: string;
  @bindable({defaultBindingMode: bindingMode.twoWay}) email?: string;
  @bindable({defaultBindingMode: bindingMode.fromView}) form: ValidationController;

  ethAddress?: string;

  private accountSubscription: Subscription;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
    validationFactory: ValidationControllerFactory,
  ) {
    this.form = validationFactory.createForCurrentScope();
    this.form.validateTrigger = validateTrigger.changeOrFocusout;
    this.form.addRenderer(new PrimeRenderer);
    this.form.addObject(this, proposalLeadValidationRules.rules);

    this.ethAddress = this.ethereumService.defaultAccountAddress;
  }

  attached(): void {
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", address => {
      this.ethAddress = address;
    });
  }

  async connectToWallet() {
    await this.ethereumService.connect();
  }

  detached() {
    this.accountSubscription.dispose();
  }
}
