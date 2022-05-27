import { StandardConfiguration } from '@aurelia/runtime-html';
import Aurelia, { DialogDefaultConfiguration, Registration, RouterConfiguration, } from 'aurelia';
import { IDataSourceDeals } from 'services/DataSourceDealsTypes';
import { FirestoreDealsService } from 'services/FirestoreDealsService';
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
  .register(Registration.singleton(IDataSourceDeals, FirestoreDealsService))
  .app(App)
  .start()
