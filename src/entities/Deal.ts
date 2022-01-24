import { autoinject } from "aurelia-framework";
import { Address, EthereumService } from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { Utils } from "services/utils";

export interface IDealConfiguration {
  address: Address;
  beneficiary: Address;
}

@autoinject
export class Deal {
  public contract: any;
  public address: Address;
  public dealInitialized: boolean;

  public initializing = true;
  public corrupt = false;

  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();

  constructor(
    private consoleLogService: ConsoleLogService,
    private ethereumService: EthereumService,
  ) {
  }

  public create(config: IDealConfiguration): Deal {
    this.initializedPromise = Utils.waitUntilTrue(() => !this.initializing, 9999999999);
    return Object.assign(this, config);
  }

  /**
   * note this is called when the contracts change
   * @param config
   * @returns
   */
  public async initialize(): Promise<void> {
    this.initializing = true;
    await this.loadContracts();
    /**
       * no, intentionally don't await
       */
    this.hydrate();
  }

  private async loadContracts(): Promise<void> {
    try {
      // this.contract = await this.contractsService.getContractAtAddress(ContractNames.DEAL, this.address);
    }
    catch (error) {
      this.corrupt = true;
      this.initializing = false;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    }
  }

  private async hydrate(): Promise<void> {
    try {
      //
    }
    catch (error) {
      this.corrupt = true;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    } finally {
      this.initializing = false;
    }
  }

  public ensureInitialized(): Promise<void> {
    return this.initializedPromise;
  }

  private async hydrateUser(): Promise<void> {
    const account = this.ethereumService.defaultAccountAddress;

    if (account) {
      //
    }
  }
}
