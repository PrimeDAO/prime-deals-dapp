import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { IDimensionRange, ImageService } from "../../services/ImageService";

export class ImageDimension extends BaseValidationRule {
  messageKey = `\${$config.dimensions.minWidth}px <= width <= \${$config.dimensions.maxWidth}px 
      and \${$config.dimensions.minHeight}px <= height <= \${$config.dimensions.maxHeight}px.`;

  constructor(private dimensions: IDimensionRange) {
    super();
  }

  public execute(value: any, _object?: IValidateable) {
    return ImageService.validateImageDimensions(value, this.dimensions);
  }
}
