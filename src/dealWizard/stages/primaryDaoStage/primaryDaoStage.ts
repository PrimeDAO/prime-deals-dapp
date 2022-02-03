import { autoinject } from "aurelia-framework";
import { IDealTokenSwapRegistration } from "entities/DealTokenSwapRegistration";
import { WizardService, IWizardState } from "services/WizardService";
import { IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";

@autoinject
export class PrimaryDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealTokenSwapRegistration>;
  public errors: Record<string, string> = {};
  public disabled: boolean;

  constructor(public wizardService: WizardService) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }
}
