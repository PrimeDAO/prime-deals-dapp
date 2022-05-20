import Aurelia, { RouterConfiguration, } from 'aurelia';
import { StandardConfiguration } from '@aurelia/runtime-html';
import { MyApp } from './my-app';
import * as ResourcesComponents from './resources/index';


Aurelia
  .register(RouterConfiguration)
  .register(ResourcesComponents)
  .register(
    StandardConfiguration
      .customize((config) => {
        config.coercingOptions.enableCoercion = true;
        // config.coercingOptions.coerceNullish = true;
      }),
  )
  .app(MyApp)
  .start()
