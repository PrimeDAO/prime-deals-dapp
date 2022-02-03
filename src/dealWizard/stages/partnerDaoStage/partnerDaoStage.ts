import { autoinject } from "aurelia-framework";
import { IDealTokenSwapRegistration } from "entities/DealTokenSwapRegistration";
import { WizardService, IWizardState } from "services/WizardService";
import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";

@autoinject
export class PartnerDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealTokenSwapRegistration>;
  public errors: Record<string, string> = {};
  public disabled: boolean;

  constructor(public wizardService: WizardService) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }
}
