import { ValidationResultPresenterService } from "@aurelia/validation-html";
import { ValidationResult } from "@aurelia/validation";
import { INode } from "aurelia";
import { PFormInput } from "../pform-input/pform-input";
import { ValidationState } from "../types";

export class PrimeErrorPresenter extends ValidationResultPresenterService {

  remove(target: INode<HTMLElement>, results: ValidationResult[]) {
    const formGroup = this.getFormGroup(target);

    results = results.filter(result => result.valid);
    if (!formGroup || !results.length) {
      return;
    }

    formGroup.validationState = undefined;
    formGroup.validationMessage = "";
  }

  add(target: INode<HTMLElement>, results: ValidationResult[]) {
    const formGroup = this.getFormGroup(target);

    results = results.filter(result => !result.valid);
    if (!formGroup || !results.length) {
      return;
    }

    formGroup.validationState = ValidationState.error;
    formGroup.validationMessage = results[0].message;
  }

  private getFormGroup(element: Element): PFormInput | undefined {
    const formGroup = element.closest("pform-input") as INode<HTMLElement>;
    return formGroup?.$au["au:resource:custom-element"].viewModel as PFormInput | undefined;
  }
}
