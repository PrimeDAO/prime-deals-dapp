import { bindable } from "aurelia-typed-observable-plugin";
import { ValidationController } from "aurelia-validation";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import "./daoStageContent.scss";
import { availableSocialMedias } from "../../dealWizardTypes";
import { WizardStateKey } from "wizards/services/WizardService";

export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable form: ValidationController;
  @bindable wizardManager: WizardStateKey;

  availableSocialMedias = availableSocialMedias.map(item => ({text: item.name, value: item.name}));

  addRepresentative() {
    this.data.representatives.push({address: ""});
  }

  removeRepresentative(index: number) {
    this.data.representatives.splice(index, 1);
    this.form.revalidateErrors();
  }

  addSocialMedia() {
    this.data.social_medias.push({name: "", url: ""});
  }

  removeSocialMedia(index: number) {
    this.data.social_medias.splice(index, 1);
    this.form.revalidateErrors();
  }
}
