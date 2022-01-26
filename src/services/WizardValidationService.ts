import { IWizardState } from "./WizardService";

export interface IProposalStageErrors {
  title?: string;
  summary?: string;
  description?: string;
}

export class WizardValidationService {

  validateProposalStage(source: IWizardState): {
    valid: boolean;
    errors: any
  } {
    const errors: IProposalStageErrors = {};

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

    return {
      valid: !Object.keys(errors).length,
      errors,
    };
  }
}
