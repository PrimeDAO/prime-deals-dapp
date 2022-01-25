import { IWizardState } from "./WizardService";

export interface IProposalErrorStates {
  title?: string;
  summary?: string;
  description?: string;
}

export class WizardValidationService {

  externalValidation(source: IWizardState): IProposalErrorStates {
    const errors: IProposalErrorStates = {};

    if (!source.wizardResult.proposal.title) {
      errors.title = "Required Input";
    }

    if (!source.wizardResult.proposal.summary) {
      errors.summary = "Required Input";
    } else if (source.wizardResult.proposal.summary.length < 10) {
      errors.summary = "Input is too short";
    }

    if (!source.wizardResult.proposal.description) {
      errors.description = "Required Input";
    } else if (source.wizardResult.proposal.description.length < 10) {
      errors.description = "Input is too short";
    }

    return errors;
  }
}
