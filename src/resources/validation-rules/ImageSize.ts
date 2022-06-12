import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { ImageService } from "../../services/ImageService";

export class ImageSize extends BaseValidationRule {
  messageKey = "Maximum image size is ${$config.maxSize > 1000000 ? $config.maxSize / 1000000 + 'MB' : $config.maxSize / 1000 + 'KB'}";

  constructor(private maxSize: number) {
    super();
  }

  public execute(value: any, _object?: IValidateable) {
    return ImageService.validateImageSize(value, this.maxSize);
  }
}
