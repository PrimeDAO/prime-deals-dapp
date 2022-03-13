// import { bindable } from "aurelia-typed-observable-plugin";
import "./dao-icon-name.scss";

import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { bindable } from "aurelia-typed-observable-plugin";
import { containerless } from "aurelia-framework";

/**
 * This is a custom display for overlaping token icons
 * <dao-icon-name />
 */
@containerless
export class DaoIconName {
  @bindable public registrationData: IDealRegistrationTokenSwap;
}
