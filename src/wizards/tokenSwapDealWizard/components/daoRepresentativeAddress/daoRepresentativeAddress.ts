import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { autoinject, bindable } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { bindingMode } from "aurelia-binding";
import { Validation } from "services/ValidationService";
import { IWizardState, WizardService, WizardStateKey } from "wizards/services/WizardService";

@autoinject
export class DaoRepresentativeAddress {
  @bindable disabled = false;
  @bindable form: ValidationController;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) representative: {address: string};
  @bindable data: IDAO;
  @bindable wizardManager: WizardStateKey;

  private wizardState: IWizardState<IDealRegistrationTokenSwap>;

  constructor(private wizardService: WizardService) {}

  bind() {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    ValidationRules
      .ensure((representative: {address: string}) => representative.address)
      .satisfiesRule(Validation.isETHAddress)
      .satisfies((value) => {
        return this.data.representatives.filter(representative => representative.address === value).length === 1;
      })
      .withMessage("Address duplicated")
      .satisfies(this.daoValidationRepresentativeRestriction.bind(this))
      .withMessage("Representative cannot be part of more than one DAO")
      .on(this.representative);
  }

  private daoValidationRepresentativeRestriction(address): boolean {
    const { primaryDAO, partnerDAO } = this.wizardState.registrationData;
    /** Don't validate, if there is no Partner DAO in the wizard */
    if (partnerDAO === undefined) return true;

    const daos = { primaryDAO, partnerDAO };
    const primaryDaoRepsAddresses = daos.primaryDAO.representatives.map(representative => representative.address);
    const partnerDaoRepsAddresses = daos.partnerDAO.representatives.map(representative => representative.address);
    const isAlreadyPrimaryDaoRep = primaryDaoRepsAddresses.includes(address);
    const isAlreadyPartnerDaoRep = partnerDaoRepsAddresses.includes(address);
    const isDuplicated = isAlreadyPrimaryDaoRep && isAlreadyPartnerDaoRep;
    const isValid = !isDuplicated;
    return isValid;
  }
}
