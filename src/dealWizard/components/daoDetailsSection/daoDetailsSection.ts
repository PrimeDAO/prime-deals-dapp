import { bindable } from "aurelia-typed-observable-plugin";

export class DaoDetailsSection {
  @bindable title: string;
  @bindable description: string;
  @bindable nameFieldLabel: string;
  @bindable avatarFieldLabel: string;
  @bindable errors: Record<string, string> = {};
  @bindable data: Record<string, string>;
  @bindable disabled = false;
}
