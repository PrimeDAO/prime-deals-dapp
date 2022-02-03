import {
  ControllerValidateResult,
  Rule,
  ValidateResult,
  ValidationController,
  ValidationRules,
} from "aurelia-validation";
import { IProposalLead } from "../entities/DealRegistrationData";
import { Validation } from "../validation";

export const proposalLeadValidationRules = ValidationRules
  .ensure<IProposalLead, string>(proposalLead => proposalLead.address)
  .required()
  .withMessage("Wallet address is required")
  .satisfiesRule(Validation.isETHAddress)
  .ensure<string>(data => data.email)
  .email()
  .withMessage("Please enter a valid e-mail");

// .rules;

export async function validateWizardState<T>(form: ValidationController, data: object, rules: Rule<T, any>[][]): Promise<[ControllerValidateResult, Record<string, string>]> {
  const formResult = await form.validate({
    object: data,
    rules,
  });

  const errors = getErrorsFromValidateResults(formResult.results);

  return [formResult, errors];
}

export function getErrorsFromValidateResults(validateResults: ValidateResult[] = []) {
  return validateResults
    .filter(item => !item.valid)
    .reverse()
    .reduce((errors, item) => {
      errors[item.propertyName] = item.message;
      return errors;
    }, {});
}
