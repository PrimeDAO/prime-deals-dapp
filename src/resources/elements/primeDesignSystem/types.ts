/**
 * These states are used for inputs in order to show different colors for each state
 */
import { Controller } from "aurelia-templating";

export enum ValidationState {
  validating = "validating",
  warning = "warning",
  error = "error"
}

export interface IStepperStep {
  name: string;
  valid: boolean;
}

export type AureliaElement<T> = HTMLElement & {
  au: {
    controller: Controller & { viewModel: T }
  }
}
