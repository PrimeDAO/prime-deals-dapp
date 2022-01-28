import { IWizardState } from "services/WizardService";

export interface IBaseWizardStage {
  wizardManager: any;
  wizardState: IWizardState;

  activate;
  attached: () => void;
}
