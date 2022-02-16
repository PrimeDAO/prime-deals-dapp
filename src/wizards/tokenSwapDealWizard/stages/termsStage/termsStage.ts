import { IStageMeta } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ValidationController } from "aurelia-validation";
import "./termsStage.scss";

@autoinject
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  private viewContent = "View";
  private editContent = "Edit";

  form: ValidationController;

  constructor(
    public wizardService: WizardService,
  ) {}

  activate(stageMeta: IStageMeta): void {
    // this.wizardManager = stageMeta.wizardManager;
    // this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    // const validationRules = ValidationRules
    //   .ensure<IProposal, string>(proposal => proposal.title)
    //   .required()
    //   .ensure<string>(proposal => proposal.summary)
    //   .required()
    //   .minLength(10)
    //   .ensure<string>(proposal => proposal.description)
    //   .required()
    //   .minLength(10)
    //   .rules;

    // this.form = this.wizardService.registerValidationRules(
    //   this.wizardManager,
    //   this.wizardState.registrationData.proposal,
    //   validationRules,
    // );
  }

  onEdit() {
    this.editContent = "Edit (changed)";
  }

  onSave() {
    this.viewContent = "View (changed)";
  }

  onDelete() {
    this.editContent = "(deleted)";
  }
}
