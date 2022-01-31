import {RouteConfig} from 'aurelia-router'

export class StagesWelcome {
  activate(params: any, routeConfig: RouteConfig, other): void {
    console.log('TCL: StagesWelcome -> params', params)
    console.log('TCL: StagesWelcome -> routeConfig', routeConfig)
    console.log('TCL: StagesWelcome -> other', other)
    if (params.stageNumber) {
      const { stageNumber } = params;
      console.log('TCL: StagesWelcome -> stageNumber', stageNumber)
    }
  }
}
