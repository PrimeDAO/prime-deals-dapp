import { RenderInstruction, ValidateResult, ValidationRenderer } from "aurelia-validation";
import { AureliaElement, ValidationState } from "../types";
import { PFormInput } from "../pform-input/pform-input";

/*
* This is a special ValidationController renderer that can be used to automatically display errors inside pform-input
* It can be used only on a pform-input that has only one element that is an input.
* */
export class PrimeRenderer implements ValidationRenderer {
  render(instruction: RenderInstruction) {
    instruction.unrender
      .filter(item => !item.result.valid)
      .reverse()
      .forEach(result => {
        result.elements.forEach(element => this.remove(element));
      });

    instruction.render
      .filter(item => !item.result.valid)
      .reverse()
      .forEach(result => {
        result.elements.forEach(element => this.add(element, result.result));
      });
  }

  add(element: Element, result: ValidateResult) {
    const formGroup = this.getFormGroup(element);
    if (!formGroup) {
      return;
    }

    formGroup.au.controller.viewModel.validationState = ValidationState.error;
    formGroup.au.controller.viewModel.validationMessage = result.message;
  }

  remove(element: Element) {
    const formGroup = this.getFormGroup(element);
    if (!formGroup) {
      return;
    }

    formGroup.au.controller.viewModel.validationState = undefined;
    formGroup.au.controller.viewModel.validationMessage = "";
  }

  private getFormGroup(element: Element) {
    return element.closest("pform-input") as unknown as (AureliaElement<PFormInput> | undefined);
  }
}
