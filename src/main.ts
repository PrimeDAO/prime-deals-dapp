import Aurelia, { DialogDefaultConfiguration, RouterConfiguration, } from 'aurelia';
import { StandardConfiguration } from '@aurelia/runtime-html';
import { MyApp } from './my-app';
import * as ResourcesComponents from './resources/index';
import {register as services} from './services/register';

new Aurelia
  (StandardConfiguration
    .customize((config) => {
      config.coercingOptions.enableCoercion = true;
      // config.coercingOptions.coerceNullish = true;
    }),
  )
  .register(RouterConfiguration)
  .register(ResourcesComponents)
  .register(DialogDefaultConfiguration)
  .register(services)
  .app(MyApp)
  .start()
