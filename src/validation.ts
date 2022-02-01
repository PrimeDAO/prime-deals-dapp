import { ValidationRules } from "aurelia-validation";
import { Utils } from "./services/utils";

export enum Validation {
  isETHAddress = "isETHAddress"
}

ValidationRules.customRule(
  Validation.isETHAddress,
  // We need to cast it to a boolean because `Utils.isAddress` returns `undefined`
  (value) => Boolean(Utils.isAddress(value)),
  "Please enter a valid wallet address",
);
