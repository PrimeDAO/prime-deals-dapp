import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { ImageService } from "../../services/ImageService";

export class ImageUrl extends BaseValidationRule {
  messageKey = "The URL does not point to an image";

  public execute(value: any, _object?: IValidateable) {
    return ImageService.isImageUrl(value);
  }
}
