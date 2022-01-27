import { IProposal, IProposalLead } from "entities/Deal";
import { IWizardState, WizardErrors } from "../services/WizardService";

export class DealWizardValidationService {

  validateProposalStage(wizardState: IWizardState): WizardErrors<IProposal> {
    const errors: WizardErrors<IProposal> = {};

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

    return errors;
  }

  validateProposalLeadStage(wizardState: IWizardState): WizardErrors<IProposalLead> {
    const errors: WizardErrors<IProposalLead> = {};

    if (!wizardState.registrationData.proposalLead.address) {
      errors.address = "Required Input";
    }

    return errors;
  }
}
