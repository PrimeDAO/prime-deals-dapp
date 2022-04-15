import { autoinject, computedFrom } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import "./leadDetailsStage.scss";
import { EthereumService } from "../../../../services/EthereumService";
import { IDealRegistrationTokenSwap, IProposalLead } from "../../../../entities/DealRegistrationTokenSwap";
import { Validation } from "../../../../services/ValidationService";

@autoinject
export class LeadDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  isOpenProposalWizard = false;
  isMakeAnOfferWizard = false;
  ethAddress?: string;
  form: ValidationController;
  private accountSubscription: Subscription;

  constructor(
    public wizardService: WizardService,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) {
  }

  @computedFrom("wizardState.registrationData.keepAdminRights", "isMakeAnOfferWizard")
  get isMakeAnOfferWizardAndKeepsAdminRights() {
    return this.wizardState.registrationData.keepAdminRights && this.isMakeAnOfferWizard;
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

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;

    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    const validationRules = ValidationRules
      .ensure<IProposalLead, string>(proposalLead => proposalLead.address)
      .required()
      .withMessage("Wallet address is required")
      .satisfiesRule(Validation.isAddressOrEns)
      .ensure<string>(data => data.email)
      .satisfiesRule(Validation.email)
      .rules;

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.proposalLead,
      validationRules,
    );
  }
}
