import { IWizardState } from "./WizardService";

export interface IProposalStageErrors {
  title?: string;
  summary?: string;
  description?: string;
}

export interface IProposalLeadStageErrors {
  address?: string;
}

export class WizardValidationService {

  validateProposalStage(wizardState: IWizardState): {
    valid: boolean;
    errors: IProposalStageErrors
  } {
    const errors: IProposalStageErrors = {};

    if (!wizardState.registrationData.proposal.title) {
      errors.title = "Required Input";
    }

    if (!wizardState.registrationData.proposal.summary) {
      errors.summary = "Required Input";
    } else if (wizardState.registrationData.proposal.summary.length < 10) {
      errors.summary = "Input is too short";
    }

    if (!wizardState.registrationData.proposal.description) {
      errors.description = "Required Input";
    } else if (wizardState.registrationData.proposal.description.length < 10) {
      errors.description = "Input is too short";
    }

    return {
      valid: !Object.keys(errors).length,
      errors,
    };
  }

  validateProposalLeadStage(wizardState: IWizardState): {
    valid: boolean;
    errors: IProposalLeadStageErrors
  } {
    const errors: IProposalLeadStageErrors = {};

    if (!wizardState.registrationData.proposalLead.address) {
      errors.address = "Required Input";
    }

    return {
      valid: !Object.keys(errors).length,
      errors,
    };
  }
}
