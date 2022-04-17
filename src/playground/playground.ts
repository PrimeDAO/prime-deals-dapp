import {PLATFORM} from "aurelia-pal";
import {RouterConfiguration} from "aurelia-router";
import { applyDiff } from "deep-diff";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { DealDataBuilder } from "../../cypress/fixtures/dealFixtures";

const deal = DealDataBuilder.create().deal;

let counter = 0;

export class Playground {
  private deal = deal;

  addNewClause() {
    const newClause: IClause = {
      id: `${counter++}`,
      text: `New Clause${counter}`,
    };

    const cloned = Utils.cloneDeep(this.deal);

    cloned.terms.clauses.push(newClause);

    applyDiff(this.deal, cloned);

    /* prettier-ignore */ console.log("TCL ~ file: playground.ts ~ line 28 ~ Playground ~ addNewClause ~ this.deal.terms.clauses.length", this.deal.terms.clauses.length);
  }

  constructor() {
    document.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key === "c") { console.clear(); }
      if (ev.key === "a") { this.addNewClause(); }
    });
  }

  private configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: "playgroundWelcome",
        route: "",
        moduleId: PLATFORM.moduleName("./playgroundWelcome/playgroundWelcome"),
        nav: true,
      },
    ]);
  }
}
