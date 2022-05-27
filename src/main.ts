import { StandardConfiguration } from '@aurelia/runtime-html';
import Aurelia, { DialogDefaultConfiguration, RouterConfiguration, } from 'aurelia';
import { MyApp } from './my-app';
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
  .app(MyApp)
  .start()
