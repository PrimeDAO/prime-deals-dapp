// import { bindable } from "aurelia-typed-observable-plugin";
import "./dao-icon-name.scss";

import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { bindable } from "aurelia-typed-observable-plugin";
import { containerless } from "aurelia-framework";

@containerless
export class DaoIconName {
  @bindable registrationData: IDealRegistrationTokenSwap;
}
