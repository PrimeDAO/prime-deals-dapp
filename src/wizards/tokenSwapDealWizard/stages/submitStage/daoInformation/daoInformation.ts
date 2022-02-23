import { bindable } from "aurelia-typed-observable-plugin";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import "./daoInformation.scss";

export class DaoInformation {
  @bindable daoData: IDAO;
}
