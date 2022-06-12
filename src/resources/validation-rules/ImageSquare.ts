import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { ImageService } from "../../services/ImageService";

export class ImageSquare extends BaseValidationRule {
  messageKey = "Image should be square";

  public execute(value: any, _object?: IValidateable) {
    return ImageService.isSquareImage(value);
  }
}
