import { valueConverter } from "aurelia";

/**
 * If value is undefined, convert to null
 */
@valueConverter("defined")
export class DefinedValueConverter {
  public fromView(value: unknown): unknown {
    return (value === undefined) ? null : value;
  }
}
