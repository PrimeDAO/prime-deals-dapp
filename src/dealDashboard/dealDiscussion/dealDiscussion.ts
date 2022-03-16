import { autoinject, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealDiscussion.scss";

@autoinject
export class DealDiscussion {
  @bindable deal: DealTokenSwap;
  @bindable.booleanAttr authorized = false;
  @bindable.string({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;
}
