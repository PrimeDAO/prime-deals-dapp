import { bindable } from "aurelia-typed-observable-plugin";
import { ValidationController } from "aurelia-validation";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import "./daoStageContent.scss";

export class DaoStageContent {
  @bindable title: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable form: ValidationController;

  availableSocialMedias = [{
    text: "Twitter",
    value: "Twitter",
  }, {
    text: "Discord",
    value: "Discord",
  }, {
    text: "Telegram",
    value: "Telegram",
  }, {
    text: "Reddit",
    value: "Reddit",
  }, {
    text: "LinkedIn",
    value: "LinkedIn",
  }];

  addRepresentative() {
    this.data.representatives.push({address: ""});
  }

  removeRepresentative(index: number) {
    this.data.representatives.splice(index, 1);
  }

  addSocialMedia() {
    this.data.social_medias.push({name: "", url: ""});
  }

  removeSocialMedia(index: number) {
    this.data.social_medias.splice(index, 1);
  }

  get representativesError() {
    return this.form.errors.find(error => error.propertyName === "representatives");
  }

  get socialMediasError() {
    return this.form.errors.find(error => error.propertyName === "social_medias");
  }
}
