import { ConsoleLogService } from "./ConsoleLogService";
import { DialogCloseResult, DialogDeactivationStatuses, IDialogService, inject } from "aurelia";

@inject()
export class DialogService {

  constructor(
    private dialogService: IDialogService,
    private consoleLogService: ConsoleLogService,
  ) {
  }

  public open(
    viewModule: unknown, // result of `import {view} from "path to module files"`
    model: unknown, // object that is given to the module's `activate` function
    settings: object = {},
    className = "pPopupModal", // gets set on ux-dialog-container
  ): Promise<DialogCloseResult> {

    /**
     * hack we gotta go through to set styling on ux-dialog-container specific
     * to the desired dialog type.
     */
    let theContainer: Element;
    return this.dialogService.open(
      Object.assign({
        model,
        viewModel: viewModule,
      }, Object.assign({}, settings, {
        position: (modalContainer: Element, _modalOverlay: Element): void => {
          theContainer = modalContainer;
          theContainer.classList.add(className);
        },
      })))
      .whenClosed(
        (result: DialogCloseResult) => {
          theContainer.classList.remove(className);
          return result;
        },
        // not sure if this always gets called
        (error: string) => {
          this.consoleLogService.logMessage(error, "error");
          // return {output: error, wasCancelled: false};
          return {value: error, status: DialogDeactivationStatuses.Error}; // TODO update other components to use status instead of `wasCancelled`
        },
      );
  }
}

export { DialogCloseResult };
