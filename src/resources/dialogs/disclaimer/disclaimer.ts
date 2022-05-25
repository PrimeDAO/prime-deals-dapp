import axios from "axios";
import { DefaultDialogDom, IDialogController, IDialogDom, inject } from "aurelia";
import { ConsoleLogService } from "../../../services/ConsoleLogService";
import { AxiosService } from "../../../services/axiosService";
import { marked } from "marked";

@inject()
export class Disclaimer {

  model: IDisclaimerModel;
  okButton: HTMLElement;
  disclaimer: string;
  loading = true;
  checked = false;

  constructor(
    @IDialogController private controller: IDialogController,
    @IDialogDom dialogDom: DefaultDialogDom,
    private consoleLogService: ConsoleLogService,
    private axiosService: AxiosService
  ) {
    dialogDom.contentHost.classList.add('disclaimer')
  }

  get disclaimerHtml(): string {
    return this.disclaimer ? marked(this.disclaimer) : "";
  }

  public activate(model: IDisclaimerModel): void {
    this.model = model;
  }

  public async attaching(): Promise<void> {
    let errorMsg: string;
    this.disclaimer = await axios.get(this.model.disclaimerUrl)
      .then((response) => {
        if (response.data) {
          this.loading = false;
          return response.data;
        } else {
          this.loading = false;
          this.consoleLogService.logMessage("Disclaimer: something went wrong", "error");
          return null;
        }
      })
      .catch((err) => {
        console.error(err)
        errorMsg = `Error fetching disclaimer: ${this.axiosService.axiosErrorHandler(err)}`;
        this.loading = false;
        return null;
      });

    if (!this.disclaimer) {
      this.controller.error(errorMsg); // TODO fix this. I am not sure how this should work in AU2
    } else {
      // attach-focus doesn't work
      this.okButton.focus();
    }
  }

  toggleAccepted() {
    this.checked = !this.checked;
  }
}

interface IDisclaimerModel {
  disclaimerUrl: string;
  title: string;
}
