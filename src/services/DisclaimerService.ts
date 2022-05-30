import { DialogCloseResult, DialogService } from "./DialogService";
import { Disclaimer } from "../resources/dialogs/disclaimer/disclaimer";
import axios from "axios";
import { BrowserStorageService } from "./BrowserStorageService";
import { Address } from "./EthereumService";
import { AxiosService } from "./axiosService";
import { DialogDeactivationStatuses, EventAggregator, IEventAggregator, inject } from "aurelia";
import { marked } from "marked";

@inject()
export class DisclaimerService {

  // private disclaimed = false;
  // private waiting = false;

  constructor(
    @IEventAggregator private eventAggregator: EventAggregator,
    private dialogService: DialogService,
    private storageService: BrowserStorageService,
    private axiosService: AxiosService,
  ) {
  }

  public getPrimeDisclaimed(accountAddress: Address): boolean {
    return accountAddress && (this.storageService.lsGet(this.getPrimeDisclaimerStatusKey(accountAddress), "false") === "true");
  }

  public async ensurePrimeDisclaimed(account: string): Promise<boolean> {
    if (!this.getPrimeDisclaimed(account)) {
      const accepted = await this.disclaimPrime(account);
      if (accepted) {
        this.storageService.lsSet(this.getPrimeDisclaimerStatusKey(account), "true");
      } else {
        return false;
      }
    }
    return true;
  }

  public async confirmMarkdown(url: string): Promise<boolean> {

    const disclaimer = await axios.get(url)
      .then((response) => {
        if (response.data) {
          return response.data;
        } else {
          return null;
        }
      })
      .catch((err) => {
        this.axiosService.axiosErrorHandler(err);
        return null;
      });

    let result = false;

    if (disclaimer) {
      try {
        marked(disclaimer);
        result = true;
      }
      // eslint-disable-next-line no-empty
      catch { }
    }
    return result;
  }

  public showDisclaimer(disclaimerUrl: string, title: string): Promise<DialogCloseResult> {
    return this.dialogService.open(() => Disclaimer, {disclaimerUrl, title});
  }

  private getPrimeDisclaimerStatusKey(accountAddress: Address): string {
    return `disclaimer-${accountAddress}`;
  }

  private async disclaimPrime(accountAddress: string): Promise<boolean> {
    let disclaimed = false;

    if (this.getPrimeDisclaimed(accountAddress)) {
      disclaimed = true;
    } else {
      const response = await this.showDisclaimer(
        "https://raw.githubusercontent.com/PrimeDAO/deals-docs/main/published-md-files/TermsOfService.md",
        "Prime Deals Disclaimer",
      );

      if (typeof response.value === "string") {
        // then an error occurred
        this.eventAggregator.publish("handleFailure", response.value);
        disclaimed = false;
      // } else if (response.wasCancelled) { // TODO check if this works
      } else if (response.status === DialogDeactivationStatuses.Error) {
        disclaimed = false;
      } else {
        disclaimed = response.value as boolean;
      }
    }
    return disclaimed;
  }
}
