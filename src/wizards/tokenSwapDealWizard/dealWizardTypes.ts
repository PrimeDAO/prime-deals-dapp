import { IWizardState } from "wizards/services/WizardService";
import { ValidationRules } from "aurelia-validation";
import { Validation } from "services/ValidationService";
import { IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";
import { WizardManager } from "./wizardManager";

export enum WizardType {createOpenProposal, editOpenProposal, createPartneredDeal, editPartneredDeal, makeAnOffer}

export interface IBaseWizardStage {
  wizardManager: any;
  wizardState: IWizardState;
  activate;
}

export interface IStageMeta<Settings = any> {
  wizardManager: WizardManager;
  wizardType: WizardType;
  settings: Settings
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
    .ensure<string>(dao => dao.logoURI)
    .required()
    .withMessage(`${title} avatar is required`)
    .satisfiesRule(Validation.imageUrl)
    .satisfiesRule(Validation.imageSize, 5000000)
    .satisfiesRule(Validation.imageExtension, ["JPG", "PNG", "GIF", "BMP"])
    .ensure<ISocialMedia[]>(dao => dao.social_medias)
    .required()
    .maxItems(5)
    .ensure<{address: string}[]>(dao => dao.representatives)
    .required()
    .minItems(1)
    .maxItems(5)
    .rules;
