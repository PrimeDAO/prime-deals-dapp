import { IWizardState } from "wizards/services/WizardService";
import { ValidationRules } from "aurelia-validation";
import { Validation } from "services/ValidationService";
import { IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";

export enum WizardType {openProposal, openProposalEdit, partneredDeal, partneredDealEdit, makeAnOffer}

export interface IBaseWizardStage {
  wizardManager: any;
  wizardState: IWizardState;
  activate;
}

export interface IStageMeta {
  wizardManager: any;
  wizardType: WizardType;
}

export const STAGE_ROUTE_PARAMETER = "stageRoute";

export const daoStageValidationRules = (title: string) =>
  ValidationRules
    .ensure<IDAO, string>(dao => dao.name)
    .required()
    .withMessage(`${title} name is required`)
    .ensure<string>(dao => dao.treasury_address)
    .required()
    .withMessage("Treasury address is required")
    .satisfiesRule(Validation.isETHAddress)
    .ensure<string>(dao => dao.logo_url)
    .required()
    .withMessage(`${title} avatar is required`)
    .satisfiesRule(Validation.imageUrl)
    .satisfiesRule(Validation.imageSize, 5000000)
    .satisfiesRule(Validation.imageSquare)
    .satisfiesRule(Validation.imageDimensions, {minWidth: 64, maxWidth: 1000, minHeight: 64, maxHeight: 1000})
    .satisfiesRule(Validation.imageExtension, ["JPG", "PNG", "GIF", "BMP"])
    .ensure<ISocialMedia[]>(dao => dao.social_medias)
    .required()
    .satisfiesRule(Validation.uniqueCollection)
    .maxItems(5)
    .ensure<{address: string}[]>(dao => dao.representatives)
    .required()
    .satisfiesRule(Validation.uniqueCollection)
    .minItems(1)
    .maxItems(5)
    .rules;
