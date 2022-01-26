export class DemosWelcome {
  viewModel: string;
  componentName: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  activate(params): void {
    if (params.componentName) {
      const { componentName } = params;
      this.componentName = componentName;
      this.viewModel = `../${componentName}`;
    }
  }

}
