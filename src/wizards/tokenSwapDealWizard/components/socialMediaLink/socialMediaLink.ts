import { IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationRules } from "@aurelia/validation";
import { IsValidUrl } from "../../../../resources/validation-rules";

@inject()
export class SocialMediaLink {
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) socialMedia: ISocialMedia;
  @bindable availableSocialMedias: string[] = [];
  @bindable data: IDAO;

  constructor(
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  binding() {
    this.validationRules
      .on(this.socialMedia)
      .ensure("url")
      .satisfiesRule(new IsValidUrl())
      .satisfies((value) => {
        return this.data.social_medias.filter(socialMedia => socialMedia.url === value).length === 1;
      })
      .withMessage("URL already provided. Please use another URL")
      .ensure((socialMedia) => socialMedia.name)
      .required()
      .withMessage("Please select one");
  }
}
