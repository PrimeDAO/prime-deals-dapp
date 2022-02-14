import { bindable } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { bindingMode } from "aurelia-binding";
import { Validation } from "services/ValidationService";
import { ISocialMedia } from "entities/DealRegistrationTokenSwap";
import "./socialMediaLink.scss";

export class SocialMediaLink {
  @bindable disabled = false;
  @bindable form: ValidationController;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) socialMedia: ISocialMedia;
  @bindable availableSocialMedias: string[] = [];

  bind() {
    ValidationRules
      .ensure((socialMedia: ISocialMedia) => socialMedia.url)
      .satisfiesRule(Validation.url)
      .ensure((socialMedia) => socialMedia.name)
      .required()
      .on(this.socialMedia);
  }
}
