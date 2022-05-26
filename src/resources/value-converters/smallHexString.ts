import { Utils } from "services/utils";
import { valueConverter } from "aurelia";

@valueConverter('smallHexString')
export class SmallHexStringValueConverter {
  public toView(value: string): string {
    return Utils.smallHexString(value);
  }
}
