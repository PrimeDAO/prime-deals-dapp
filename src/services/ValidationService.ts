import { ValidationRules } from "aurelia-validation";
import { Utils } from "./utils";

export enum Validation {
  isETHAddress = "isETHAddress",
  email = "email",
  url = "url",
  uniqueCollection = "uniqueCollection",
}

ValidationRules.customRule(
  Validation.isETHAddress,
  // We need to cast it to a boolean because `Utils.isAddress` returns `undefined`
  (value) => Boolean(Utils.isAddress(value)),
  "Please enter a valid wallet address",
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
  Validation.uniqueCollection,
  (value) => Utils.isUniqueSimpleCollection(value),
  "Please enter unique values",
);
