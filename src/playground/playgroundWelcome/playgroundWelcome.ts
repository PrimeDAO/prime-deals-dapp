export class PlaygroundWelcome {
  view: string;
  viewModel: string;
  componentName: any;

  private onlyViewsList = [];

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  activate(params): void {
    console.log("TCL ~ file: playgroundWelcome.ts ~ line 10 ~ PlaygroundWelcome ~ activate ~ params", params);
    if (params.componentName) {
      const { componentName } = params;
      this.componentName = componentName;

      if (this.onlyViewsList.includes(componentName)) {
        this.view = getViewPath(componentName);
        this.viewModel = undefined;
      } else {
        this.viewModel = `../${componentName}/${componentName}`;
        console.log("TCL ~ file: playgroundWelcome.ts ~ line 19 ~ PlaygroundWelcome ~ activate ~ this.viewModel", this.viewModel);
        this.view = undefined;
      }
    }
  }

}

function getViewPath(componentName: string): string {
  return `../${componentName}.html`;
}
