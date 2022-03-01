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
    PLATFORM.moduleName("./pcircled-number/pcircled-number"),
    PLATFORM.moduleName("./pstepper/pstepper"),
    PLATFORM.moduleName("./pform-input/pform-input"),
    PLATFORM.moduleName("./ptoggle/ptoggle"),
    PLATFORM.moduleName("./pinput-group/pinput-group"),
    PLATFORM.moduleName("./pcountdown-circular/pcountdown-circular"),
    PLATFORM.moduleName("./prange-slider/prange-slider"),
    PLATFORM.moduleName("./pcountdown-closebutton/pcountdown-closebutton"),
    PLATFORM.moduleName("./ppopup-notification/ppopup-notification"),
    PLATFORM.moduleName("./ppopup-modal/ppopup-modal"),
    PLATFORM.moduleName("./ptooltip/ptooltip"),
  ]);
}
