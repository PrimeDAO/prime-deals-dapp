import { bindable } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { bindingMode } from "aurelia-binding";
import { Validation } from "services/ValidationService";
import { IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";
import "./socialMediaLink.scss";

export class SocialMediaLink {
  @bindable disabled = false;
  @bindable form: ValidationController;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) socialMedia: ISocialMedia;
  @bindable availableSocialMedias: string[] = [];
  @bindable data: IDAO;

  bind() {
    ValidationRules
      .ensure((socialMedia: ISocialMedia) => socialMedia.url)
      .satisfiesRule(Validation.url)
      .satisfies((value) => {
        return this.data.social_medias.filter(socialMedia => socialMedia.url === value).length === 1;
      })
      .withMessage("URL duplicated")
      .ensure((socialMedia) => socialMedia.name)
      .required()
      .withMessage("Please select one")
      .on(this.socialMedia);
  }
}
