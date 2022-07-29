import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { bindable, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";

@inject()
export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;

  availableSocialMedias = availableSocialMedias.map(item => ({text: item.name, value: item.name}));

  constructor(@IValidationController private form: IValidationController) {
  }

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
