import { bindable } from "aurelia";
import { IPSelectItemConfig } from "resources/elements/primeDesignSystem/pselect/pselect";
import "./pselect-daos.scss";

export class PSelectDaos {
  @bindable data: IPSelectItemConfig[];
  // @bindable value: string | string[];
  @bindable disabled: boolean;
}
