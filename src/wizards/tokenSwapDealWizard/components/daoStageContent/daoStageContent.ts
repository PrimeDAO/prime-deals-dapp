import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { WizardStateKey } from "wizards/services/WizardService";
import { bindable } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";

@processContent(autoSlot)
export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;
  @bindable wizardManager: WizardStateKey;

  availableSocialMedias = availableSocialMedias.map(item => ({text: item.name, value: item.name}));

  addRepresentative() {
    this.data.representatives.push({address: ""});
  }

  removeRepresentative(index: number) {
    this.data.representatives.splice(index, 1);
    // this.form.revalidateErrors(); // TODO check this method
  }

  addSocialMedia() {
    this.data.social_medias.push({name: "", url: ""});
  }

  removeSocialMedia(index: number) {
    this.data.social_medias.splice(index, 1);
    // this.form.revalidateErrors(); // TODO check this method
  }
}
