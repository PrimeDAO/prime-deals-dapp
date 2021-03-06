import { autoinject } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { Utils } from "./utils";
import { ImageService } from "./ImageService";
import { EnsService } from "services/EnsService";

export enum Validation {
  isEthAddress = "isEthAddress",
  isEthAddressOrEns = "isEthAddressOrEns",
  email = "email",
  url = "url",
  imageUrl = "imageUrl",
  imageSize = "imageSize",
  imageSquare = "imageSquare",
  imageDimensions = "imageDimensions",
  imageExtension = "imageExtension",
}

@autoinject
export class ValidationService {

  constructor(
    ensService: EnsService,
  ) {

    ValidationRules.customRule(
      Validation.isEthAddress,
      (value) => Utils.isAddress(value),
      "Please enter a valid ethereum address",
    );

    ValidationRules.customRule(
      Validation.isEthAddressOrEns,
      async (value) => ensService.getAddressForEns(value).then((address) =>
      {
        return !!address;
      }),
      "Please enter a valid ethereum address or ENS",
    );

    ValidationRules.customRule(
      Validation.email,
      (value) => Utils.isValidEmail(value, true),
      "Please enter a valid email address",
    );

    ValidationRules.customRule(
      Validation.url,
      (value) => Utils.isValidUrl(value),
      "Please enter a valid url",
    );

    ValidationRules.customRule(
      Validation.imageUrl,
      (value) => ImageService.isImageUrl(value),
      "The URL does not point to an image",
    );

    ValidationRules.customRule(
      Validation.imageSize,
      (value, obj, maxSize) => ImageService.validateImageSize(value, maxSize),
      "Maximum image size is ${$config.maxSize > 1000000 ? $config.maxSize / 1000000 + 'MB' : $config.maxSize / 1000 + 'KB'}",
      (maxSize) => ({maxSize}),
    );

    ValidationRules.customRule(
      Validation.imageSquare,
      (value) => ImageService.isSquareImage(value),
      "Image should be square",
    );

    ValidationRules.customRule(
      Validation.imageDimensions,
      (value, obj, dimensions) => ImageService.validateImageDimensions(value, dimensions),
      `\${$config.dimensions.minWidth}px <= width <= \${$config.dimensions.maxWidth}px 
      and \${$config.dimensions.minHeight}px <= height <= \${$config.dimensions.maxHeight}px.`,
      (dimensions) => ({dimensions}),
    );

    ValidationRules.customRule(
      Validation.imageExtension,
      (value, obj, extensions) => ImageService.validateImageExtension(value, extensions),
      "Image should have one of the extensions: ${$config.extensions.join(', ')}",
      (extensions) => ({extensions}),
    );

  }
}

/**
 * Get the validation result from each ValidationController in an array
 * @param forms
 */
export function validateForms(forms: ValidationController[]) {
  return Promise.all(
    forms.map(form => form.validate().then(result => result.valid)),
  );
}

/**
 * Returns true if all the ValidationControllers are valid
 * @param forms
 */
export async function areFormsValid(forms: ValidationController[]) {
  const validationResults = await validateForms(forms);

  return validationResults.filter(Boolean).length === validationResults.length;
}
