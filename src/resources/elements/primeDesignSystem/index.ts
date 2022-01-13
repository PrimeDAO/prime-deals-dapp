import { FrameworkConfiguration } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("./pbutton/pbutton"),
    PLATFORM.moduleName("./pcard/pcard"),
    PLATFORM.moduleName("./pselect/pselect"),
    PLATFORM.moduleName("./pinput-numeric/pinput-numeric"),
    PLATFORM.moduleName("./pinput-text/pinput-text"),
    PLATFORM.moduleName("./ptextarea/ptextarea"),
  ]);
}
