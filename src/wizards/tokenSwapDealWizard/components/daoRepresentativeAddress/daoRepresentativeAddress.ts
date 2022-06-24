import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService, WizardStateKey } from "wizards/services/WizardService";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationRules } from "@aurelia/validation";
import { IsEthAddress } from "../../../../resources/validation-rules";

@inject()
export class DaoRepresentativeAddress {
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) representative: { address: string };
  @bindable data: IDAO;
  @bindable wizardManager: WizardStateKey;

  private wizardState: IWizardState<IDealRegistrationTokenSwap>;

  constructor(
    private wizardService: WizardService,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  binding() {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.validationRules
      .on(this.representative)
      .ensure("address")
      .required()
      .satisfiesRule(new IsEthAddress())
      .satisfies((value) => {
        return this.data.representatives.filter(representative => representative.address === value).length === 1;
      })
      .withMessage("Address duplicated")
      .satisfies(this.daoValidationRepresentativeRestriction.bind(this))
      .withMessage("The same account cannot represent more than one DAO");
  }

  private daoValidationRepresentativeRestriction(address): boolean {
    const {primaryDAO, partnerDAO} = this.wizardState.registrationData;
    /** Don't validate, if there is no Partner DAO in the wizard */
    if (partnerDAO === undefined) return true;

    const daos = {primaryDAO, partnerDAO};
    const primaryDaoRepsAddresses = daos.primaryDAO.representatives.map(representative => representative.address);
    const partnerDaoRepsAddresses = daos.partnerDAO?.representatives.map(representative => representative.address) ?? [];
    const isAlreadyPrimaryDaoRep = primaryDaoRepsAddresses.includes(address);
    const isAlreadyPartnerDaoRep = partnerDaoRepsAddresses.includes(address);
    const isDuplicated = isAlreadyPrimaryDaoRep && isAlreadyPartnerDaoRep;
    const isValid = !isDuplicated;
    return isValid;
  }
}
