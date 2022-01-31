import { ControllerValidateResult, Rule, ValidationController, ValidationRules } from "aurelia-validation";
import { IProposalLead } from "../entities/Deal";

export const proposalLeadValidationRules = ValidationRules
  .ensure<IProposalLead, string>(proposalLead => proposalLead.address)
  .satisfiesRule("isETHAddress")
  .ensure<string>(data => data.email)
  .email()
  .withMessage("Please enter a valid e-mail")
  .rules;

export async function validateWizardState<T>(form: ValidationController, data: object, rules: Rule<T, any>[][]): Promise<[ControllerValidateResult, Record<string, string>]> {
  const formResult = await form.validate({
    object: data,
    rules,
  });

  const errors = formResult.results
    .filter(item => !item.valid)
    .reduce((errors, item) => {
      errors[item.propertyName] = item.message;
      return errors;
    }, {});

  return [formResult, errors];
}
