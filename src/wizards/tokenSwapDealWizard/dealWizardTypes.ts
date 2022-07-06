// import { ValidationRules } from "aurelia-validation";
// import { Validation } from "services/ValidationService";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { IValidationRules } from "@aurelia/validation";
import { ImageExtension, ImageSize, ImageUrl, IsEthAddress } from "../../resources/validation-rules";

export enum WizardType {createOpenProposal, editOpenProposal, createPartneredDeal, editPartneredDeal, makeAnOffer}

export interface IStageMeta<Settings = any> {
  wizardType: WizardType;
  settings?: Settings
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

export const daoStageValidationRules = (dao: IDAO, validationRules: IValidationRules, title: string, otherDao: IDAO | null) =>
  validationRules
    .on(dao)
    .ensure("name")
    .required()
    .withMessage(`${title} name is required`)
    .satisfies((value: string) => !otherDao || (value?.toLowerCase() !== otherDao.name?.toLowerCase()))
    .withMessage("Name already used for the other DAO")
    .ensure("treasury_address")
    .required()
    .withMessage("Treasury address is required")
    .satisfiesRule(new IsEthAddress())
    .withMessage("Please enter a valid ethereum address")
    .satisfies(value => !otherDao || (value !== otherDao.treasury_address))
    .withMessage("Address already used for the other DAO")
    .ensure("logoURI")
    .required()
    .withMessage(`${title} avatar is required`)
    .satisfiesRule(new ImageUrl())
    .withMessage("The URL does not point to an image")
    .satisfiesRule(new ImageSize(5000000))
    .satisfiesRule(new ImageExtension(["JPG", "PNG", "GIF", "BMP"]))
    .ensure("social_medias")
    .required()
    .maxItems(10)
    .ensure("representatives")
    .required()
    .minItems(1)
    .maxItems(5);
