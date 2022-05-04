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

export const availableSocialMedias = [
  {
    name: "Twitter",
    icon: "fab fa-twitter",
  },
  {
    name: "Discord",
    icon: "fab fa-discord",
  },
  {
    name: "Telegram",
    icon: "fab fa-telegram-plane",
  },
  {
    name: "Reddit",
    icon: "fab fa-reddit",
  },
  {
    name: "Linkedin",
    icon: "fab fa-linkedin",
  },
  {
    name: "Facebook",
    icon: "fab fa-facebook",
  },
  {
    name: "Whitepaper",
    icon: "fas fa-file-alt",
  },
  {
    name: "Forum",
    icon: "fas fa-comments",
  },
  {
    name: "Github",
    icon: "fab fa-github",
  },
  {
    name: "YouTube",
    icon: "fab fa-youtube",
  },
  {
    name: "Newsletter",
    icon: "fas fa-newspaper",
  },
];

export const STAGE_ROUTE_PARAMETER = "stageRoute";

export const daoStageValidationRules = (title: string, otherDao?: IDAO) =>
  ValidationRules
    .ensure<IDAO, string>(dao => dao.name)
    .required()
    .withMessage(`${title} name is required`)
    .satisfies(value => value !== otherDao?.name)
    .withMessage("Name already used for the other DAO")
    .ensure<string>(dao => dao.treasury_address)
    .required()
    .withMessage("Treasury address is required")
    .satisfiesRule(Validation.isEthAddress)
    .satisfies(value => value !== otherDao?.treasury_address)
    .withMessage("Address already used for the other DAO")
    .ensure<string>(dao => dao.logoURI)
    .required()
    .withMessage(`${title} avatar is required`)
    .satisfiesRule(Validation.imageUrl)
    .satisfiesRule(Validation.imageSize, 5000000)
    .satisfiesRule(Validation.imageExtension, ["JPG", "PNG", "GIF", "BMP"])
    .ensure<ISocialMedia[]>(dao => dao.social_medias)
    .required()
    .maxItems(10)
    .ensure<{address: string}[]>(dao => dao.representatives)
    .required()
    .minItems(1)
    .maxItems(5)
    .rules;
