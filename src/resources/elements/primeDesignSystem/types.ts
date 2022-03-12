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
  hidden?: boolean;
}

export type AureliaElement<T> = HTMLElement & {
  au: {
    controller: Controller & { viewModel: T }
  }
}

/**
 * used by ppopup-notification
 */
export enum EventMessageType {
  none = 0,
  Failure = 1,
  Exception = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
  Success = 5,
  Transaction = 6,
}
