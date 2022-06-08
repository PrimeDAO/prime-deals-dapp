export class PlaygroundWelcome {
  view: string;
  viewModel: string;
  componentName: any;

  private onlyViewsList = [];

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  load(params): void {
    if (params.componentName) {
      const { componentName } = params;
      this.componentName = componentName;

      if (this.onlyViewsList.includes(componentName)) {
        this.view = getViewPath(componentName);
        this.viewModel = undefined;
      } else {
        this.viewModel = `../${componentName}/${componentName}`;
        this.view = undefined;
      }
    }
  }

}

function getViewPath(componentName: string): string {
  return `../${componentName}.html`;
}
