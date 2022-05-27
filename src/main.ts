import { StandardConfiguration } from '@aurelia/runtime-html';
import Aurelia, { DialogDefaultConfiguration, RouterConfiguration, } from 'aurelia';
import { App } from './app';
import * as ResourcesComponents from './resources/index';
import { register as services } from './services/register';

new Aurelia()
  .register(StandardConfiguration.customize(x => {
    x.coercingOptions.enableCoercion = true
  }))
  .register(RouterConfiguration)
  .register(ResourcesComponents)
  .register(DialogDefaultConfiguration)
  .register(services)
  .app(App)
  .start()
