import { StandardConfiguration } from "@aurelia/runtime-html";
import { ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import Aurelia, { DialogDefaultConfiguration } from "aurelia";
import { App } from "./app";
import * as ResourceComponents from "./resources";
import { register as services } from "./services/register";
import * as valueConverters from "./resources/value-converters";
import { AllowedNetworks, EthereumService, Networks } from "services";
import { RouterConfiguration } from "@aurelia/router";

new Aurelia()
  .register(StandardConfiguration.customize(x => {
    x.coercingOptions.enableCoercion = true;
  }))
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: false,
    useHref: false,
    title: "${componentTitles}${appTitleSeparator}Prime Deals",
  }))
  .register(ValidationHtmlConfiguration.customize((options) => {
    options.DefaultTrigger = ValidationTrigger.changeOrFocusout;
  }))
  .register(DialogDefaultConfiguration)
  .register(ResourceComponents)
  .register(services)
  .register(valueConverters)
  .app(App)
  .start();
