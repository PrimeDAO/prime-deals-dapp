import { IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";

@inject()
export class SocialMediaLink {
  @bindable disabled = false;
  @bindable form: IValidationController;
  @bindable({mode: BindingMode.twoWay}) socialMedia: ISocialMedia;
  @bindable availableSocialMedias: string[] = [];
  @bindable data: IDAO;

  binding() {
    // ValidationRules // TODO add rules back
    //   .ensure((socialMedia: ISocialMedia) => socialMedia.url)
    //   .satisfiesRule(Validation.url)
    //   .satisfies((value) => {
    //     return this.data.social_medias.filter(socialMedia => socialMedia.url === value).length === 1;
    //   })
    //   .withMessage("URL already provided. Please use another URL")
    //   .ensure((socialMedia) => socialMedia.name)
    //   .required()
    //   .withMessage("Please select one")
    //   .on(this.socialMedia);
  }
}
