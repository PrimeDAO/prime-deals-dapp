import { EnsService } from "services/EnsService";
import { inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { IsEthAddressOrEns } from "../resources/validation-rules";
import { IsValidIERC20Address } from "../resources/validation-rules/IsValidIERC20Address";
import { TokenService } from "./TokenService";

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

@inject()
export class ValidationService {

  constructor(
    public ensService: EnsService,
    public tokenService: TokenService,
  ) {
  }

  public isEthAddressOrEns() {
    return new IsEthAddressOrEns(this.ensService);
  }

  public isValidIERC20Address() {
    return new IsValidIERC20Address(this.tokenService);
  }

}

/**
 * Get the validation result from each ValidationController in an array
 * @param forms
 */
export function validateForms(forms: IValidationController[]) {
  return Promise.all(
    forms.map(form => form.validate().then(result => result.valid)),
  );
}

/**
 * Returns true if all the ValidationControllers are valid
 * @param forms
 */
export async function areFormsValid(forms: IValidationController[]) {
  const validationResults = await validateForms(forms);

  return validationResults.filter(Boolean).length === validationResults.length;
}
