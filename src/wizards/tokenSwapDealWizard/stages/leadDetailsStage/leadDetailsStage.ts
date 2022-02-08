import { autoinject } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import "./leadDetailsStage.scss";
import { Validation } from "../../../../validation";
import { EthereumService } from "../../../../services/EthereumService";
import { IDealRegistrationTokenSwap, IProposalLead } from "../../../../entities/DealRegistrationTokenSwap";

@autoinject
export class LeadDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  isOpenProposalPage = false;
  ethAddress?: string;
  form: ValidationController;
  private accountSubscription: Subscription;

  constructor(
    public wizardService: WizardService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.isOpenProposalPage = stageMeta.wizardType === WizardType.openProposal;

    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    const validationRules = ValidationRules
      .ensure<IProposalLead, string>(proposalLead => proposalLead.address)
      .required()
      .withMessage("Wallet address is required")
      .satisfiesRule(Validation.isETHAddress)
      .ensure<string>(data => data.email)
      .satisfiesRule(Validation.email)
      .rules;

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.proposalLead,
      validationRules,
    );
  }

  attached(): void {
    this.ethAddress = this.ethereumService.defaultAccountAddress;
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", address => {
      this.ethAddress = address;
    });
  }

  connectToWallet() {
    this.ethereumService.ensureConnected();
  }

  detached() {
    this.accountSubscription.dispose();
  }
}
