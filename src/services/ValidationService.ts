import { ValidationRules } from "aurelia-validation";
import { Utils } from "./utils";
import { ImageService } from "./ImageService";

export enum Validation {
  isETHAddress = "isETHAddress",
  email = "email",
  url = "url",
  imageUrl = "imageUrl",
  imageSize = "imageSize",
  imageSquare = "imageSquare",
  imageDimensions = "imageDimensions",
  imageExtension = "imageExtension",
}

ValidationRules.customRule(
  Validation.isETHAddress,
  // We need to cast it to a boolean because `Utils.isAddress` returns `undefined`
  (value) => Boolean(Utils.isAddress(value)),
  "Please enter a valid ethereum address",
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
