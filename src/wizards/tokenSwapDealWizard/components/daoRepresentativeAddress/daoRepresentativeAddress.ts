import { IDAO } from "entities/DealRegistrationTokenSwap";
import { bindable } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { bindingMode } from "aurelia-binding";
import { Validation } from "services/ValidationService";

export class DaoRepresentativeAddress {
  @bindable disabled = false;
  @bindable form: ValidationController;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) representative: {address: string};
  @bindable data: IDAO;
  bind() {
    ValidationRules
      .ensure((representative: {address: string}) => representative.address)
      .satisfiesRule(Validation.isETHAddress)
      .satisfies((value) => {
        return this.data.representatives.filter(representative => representative.address === value).length === 1;
      })
      .withMessage("Address duplicated")
      .on(this.representative);
  }
}
