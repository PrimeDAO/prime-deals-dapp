import "./registry-wizard.scss";
import { PLATFORM } from "aurelia-pal";
import { singleton, computedFrom } from "aurelia-framework";
import { ISeedConfig, SeedConfig } from "./seedConfig";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import { IStageState, IWizardState } from "registry-wizard/baseStage";

/**
 * this is the max "real" stage that gathers input from the user and requires
 * validatation of inputs. Reminder that stages are one-indexed.
 */
const maxStage = 4;

@singleton(false)
export class NewDeal {
  router: Router;

  seedConfig: ISeedConfig;
  stageStates: Array<IStageState>;
  wizardState: IWizardState;
  sideBar: HTMLElement;

  @computedFrom("router.currentInstruction")
  get currentStage(): RouteConfig {
    return this.router.currentInstruction.config;
  }

  constructor() {
    if (!this.seedConfig) {
      this.seedConfig = new SeedConfig();
      this.wizardState = {};
      /**
       * stageStates is 1-based, indexed by stage number
       */
      this.stageStates = [
        undefined,
        {
          verified: false,
          title: "Proposal",
        },
        {
          verified: false,
          title: "DAO's",
        },
        {
          verified: false,
          title: "Terms",
        },
        {
          verified: false,
          title: "Submit",
        },
        {
          verified: true,
          title: "Thank you!",
        },
      ];
    }
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    const routes = [
      {
        route: ["", "stage1"],
        nav: true,
        moduleId: PLATFORM.moduleName("./stage1"),
        name: "stage1",
        title: this.stageStates[1].title,
        settings: {
          seedConfig: this.seedConfig,
          stageStates: this.stageStates,
          stageNumber: 1,
          maxStage,
          wizardState: this.wizardState },
      },
      {
        route: ["stage2"],
        nav: true,
        moduleId: PLATFORM.moduleName("./stage2"),
        name: "stage2",
        title: this.stageStates[2].title,
        settings: {
          seedConfig: this.seedConfig,
          stageStates: this.stageStates,
          stageNumber: 2,
          maxStage,
          wizardState: this.wizardState },
      },
      {
        route: ["stage3"],
        nav: true,
        moduleId: PLATFORM.moduleName("./stage3"),
        name: "stage3",
        title: this.stageStates[3].title,
        settings: {
          seedConfig: this.seedConfig,
          stageStates: this.stageStates,
          stageNumber: 3,
          maxStage,
          wizardState: this.wizardState },
      },
      {
        route: ["stage4"],
        nav: true,
        moduleId: PLATFORM.moduleName("./stage4"),
        name: "stage4",
        title: this.stageStates[4].title,
        settings: {
          seedConfig: this.seedConfig,
          stageStates: this.stageStates,
          stageNumber: 4,
          maxStage,
          wizardState: this.wizardState },
      },
      {
        route: ["stage5"],
        nav: false,
        moduleId: PLATFORM.moduleName("./stage5"),
        name: "stage5",
        title: this.stageStates[5].title,
        settings: {
          seedConfig: this.seedConfig,
          stageStates: this.stageStates,
          stageNumber: 5,
          maxStage,
          wizardState: this.wizardState },
      },
    ];

    config.map(routes);

    this.router = router;
  }

  setStage(route: string): void {
    this.router.navigate(route);
  }

  toggleSideBar(): void {
    if (this.sideBar.classList.contains("show")) {
      this.sideBar.classList.remove("show");
    } else {
      this.sideBar.classList.add("show");
    }
  }
}

