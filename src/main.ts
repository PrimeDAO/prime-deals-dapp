import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { StandardConfiguration } from "@aurelia/runtime-html";
import Aurelia, { DialogDefaultConfiguration } from "aurelia";
import {RouterConfiguration} from "@aurelia/router";
import { App } from "./app";
import * as ResourceComponents from "./resources";
import { register as services } from "./services/register";
import * as valueConverters from "./resources/value-converters";
import { AllowedNetworks, EthereumService, Networks } from "services";

new Aurelia()
  .register(StandardConfiguration.customize(x => {
    x.coercingOptions.enableCoercion = true;
  }))
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: false,
    useHref: false,
  }))
  .register(DialogDefaultConfiguration)
  .register(ResourceComponents)
  .register(services)
  .register(valueConverters)
  .app(App)
  .start();
