import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { ImageService } from "../../services/ImageService";

export class ImageExtension extends BaseValidationRule {
  messageKey = "The URL does not point to an image";

  constructor(private extensions: string[]) {
    super();
  }

  public execute(value: any, _object?: IValidateable) {
    return ImageService.validateImageExtension(value, this.extensions);
  }
}
