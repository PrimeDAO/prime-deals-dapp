import { StandardConfiguration } from '@aurelia/runtime-html';
import Aurelia, { DialogDefaultConfiguration, Registration, RouterConfiguration, } from 'aurelia';
import { App } from './app';

new Aurelia()
  .register(StandardConfiguration.customize(x => {
    x.coercingOptions.enableCoercion = true
  }))
  .register(RouterConfiguration)
  .register(DialogDefaultConfiguration)

  // .register(ResourcesComponents)
  // .register(services)
  // .register(Registration.singleton(IDataSourceDeals, FirestoreDealsService))
  .app(App)
  .start()
