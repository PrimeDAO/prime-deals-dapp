import { EnsService } from "services/EnsService";
import { IsEthAddressOrEns } from "./../../../../resources/validation-rules/IsEthAddressOrEns";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import { IEthereumService } from "../../../../services/EthereumService";
import { IDealRegistrationTokenSwap, IProposalLead } from "../../../../entities/DealRegistrationTokenSwap";
import { IDisposable, IEventAggregator, inject } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";
import { IsEmail } from "../../../../resources/validation-rules";
import { IValidationController } from "@aurelia/validation-html";

@processContent(autoSlot)
export class LeadDetailsStage {
  wizardManager: any;
  isOpenProposalWizard = false;
  isMakeAnOfferWizard = false;
  ethAddress?: string;
  proposalLead: IProposalLead = {};
  private accountSubscription: IDisposable;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @IValidationController public form: IValidationController,
    @IEthereumService private ethereumService: IEthereumService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IValidationRules private validationRules: IValidationRules,
    private ensService: EnsService,
  ) {
    this.proposalLead = this.registrationData?.proposalLead;
    this.validationRules
      .on(this.proposalLead)
      .ensure("address")
      .required()
      .withMessage("Wallet address or ENS is required")
      .satisfiesRule(new IsEthAddressOrEns(this.ensService))
      .withMessage("Please enter a valid ethereum address or ENS")
      .ensure("email")
      .satisfiesRule(new IsEmail())
      .withMessage("Please enter a valid email address");

  }

  attaching(): void {
    this.ethAddress = this.ethereumService.defaultAccountAddress;
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", (address: string) => {
      this.ethAddress = address;
    });
  }

  get isMakeAnOfferWizardAndKeepsAdminRights() {
    return this.registrationData?.keepAdminRights && this.isMakeAnOfferWizard;
  }

  connectToWallet() {
    this.ethereumService.ensureConnected();
  }

  detaching() {
    this.accountSubscription.dispose();
  }

  load(stageMeta: IStageMeta): void {
    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;

  }
}
