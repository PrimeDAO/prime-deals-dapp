import { EventConfigFailure } from "../services/GeneralEvents";
import { autoinject, singleton, computedFrom } from "aurelia-framework";
import "./baseStage.scss";
import { IDealConfig } from "./dealConfig";
import { RouteConfig } from "aurelia-router";
import { Router } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";
import { Address, Hash } from "services/EthereumService";
import { DealService, IDaoAPIObject } from "../services/DealService";

export interface IStageState {
  verified: boolean;
  title: string;
}

export interface IWizardState {
  dealHash?: Hash;
  whiteList?: string;
  fundingTokenSymbol?: string;
  fundingTokenIcon?: string;
  dealTokenSymbol?: string;
  dealTokenIcon?: string;
  requiredDealDeposit?: number;
  requiredDealFee?: number;
  dealAdminAddress?: Address;
}

@singleton(false)
@autoinject
export abstract class BaseStage {
  protected dealConfig: IDealConfig;
  protected stageNumber: number;
  protected maxStage: number;
  protected stageStates: Array<IStageState>;
  protected wizardState: IWizardState;

  protected daoList: Array<IDaoAPIObject>;

  @computedFrom("stageStates", "stageNumber")
  protected get stageState(): IStageState { return this.stageStates[this.stageNumber]; }

  protected readonly dealFee = .01;

  constructor(
    protected dealService: DealService,
    protected router: Router,
    protected eventAggregator: EventAggregator) {
  }

  activate(_params: unknown, routeConfig: RouteConfig): void {
    Object.assign(this, routeConfig.settings);
  }

  async detached(): Promise<void> {
    const message = await this.validateInputs();
    if (!message) {
      this.persistData();
    }
  }

  protected cancel(): void {
    this.router.parent.navigate("home");
  }

  protected next(): void {
    this.router.navigate(`stage${this.stageNumber + 1}`);
  }

  protected back(): void {
    if (this.stageNumber > 1) {
      this.router.navigate(`stage${this.stageNumber - 1}`);
    } else {
      this.router.parent.navigate("initiate");
    }
  }

  protected async proceed(moveOn = true): Promise<boolean> {
    const message: string = await this.validateInputs();
    if (message) {
      this.validationError(message);
      return false;
    } else {
      if (moveOn) {
        this.next();
      }
      return true;
    }
  }

  protected validateInputs(): Promise<string> {
    return Promise.resolve(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected persistData(): void {
  }

  protected validationError(message: string): void {
    this.eventAggregator.publish("handleValidationError", new EventConfigFailure(message));
  }
}
