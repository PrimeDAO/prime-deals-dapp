import axios from "axios";
import { IDialogController, inject } from "aurelia";
import { ConsoleLogService } from "../../../services/ConsoleLogService";
import { AxiosService } from "../../../services/axiosService";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const marked = require("marked");

@inject()
export class Disclaimer {

  model: IDisclaimerModel;
  okButton: HTMLElement;
  disclaimer: string;
  loading = true;
  checked = false;

  constructor(
    private controller: IDialogController,
    private consoleLogService: ConsoleLogService,
    private axiosService: AxiosService) {
  }

  get disclaimerHtml(): string {
    return this.disclaimer ? marked(this.disclaimer) : "";
  }

  public activate(model: IDisclaimerModel): void {
    this.model = model;
  }

  public async attached(): Promise<void> {
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
        errorMsg = `Error fetching disclaimer: ${this.axiosService.axiosErrorHandler(err)}`;
        this.loading = false;
        return null;
      });

    if (!this.disclaimer) {
      // this.controller.close(false, errorMsg); // TODO fix this
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
