import { bindable } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { bindingMode } from "aurelia-binding";
import { Validation } from "services/ValidationService";

export class DaoRepresentativeAddress {
  @bindable disabled = false;
  @bindable form: ValidationController;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) representative: {address: string};

  bind() {
    ValidationRules
      .ensure((representative: {address: string}) => representative.address)
      .satisfiesRule(Validation.isETHAddress)
      .on(this.representative);
  }
}
