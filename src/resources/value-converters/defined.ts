/**
 * If value is undefined, convert to null
 */
export class DefinedValueConverter {
  public fromView(value: unknown): unknown {
    return (value === undefined) ? null : value;
  }
}
