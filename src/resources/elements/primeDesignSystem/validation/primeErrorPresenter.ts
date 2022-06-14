import { ValidationResultPresenterService } from "@aurelia/validation-html";
import { ValidationResult } from "@aurelia/validation";
import { INode } from "aurelia";
import { PFormInput } from "../pform-input/pform-input";
import { ValidationState } from "../types";

export class PrimeErrorPresenter extends ValidationResultPresenterService {

  remove(target: INode<HTMLElement>, results: ValidationResult[]) {
    const formInput = this.getFormInput(target);

    results = results.filter(result => !result.valid);
    if (!formInput || !results.length) {
      return;
    }

    formInput.validationState = undefined;
    formInput.validationMessage = "";
  }

  add(target: INode<HTMLElement>, results: ValidationResult[]) {
    const formInput = this.getFormInput(target);

    results = results.filter(result => !result.valid);
    if (!formInput || !results.length) {
      return;
    }

    formInput.validationState = ValidationState.error;
    formInput.validationMessage = results[0].message;
  }

  private getFormInput(element: Element): PFormInput | undefined {
    const formInput = element.closest("pform-input") as INode<HTMLElement>;
    return formInput?.$au["au:resource:custom-element"].viewModel as PFormInput | undefined;
  }
}
