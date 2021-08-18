// import { BigNumber } from "ethers";
import { autoinject } from "aurelia-framework";
import { BaseStage } from "registry-wizard/baseStage";
// import { Utils } from "services/utils";

@autoinject
export class Stage3 extends BaseStage {

  addClause(): void {
    this.seedConfig.terms.clauses.push({text: undefined, tag: undefined});
  }

  deleteClause(index:number): void {
    this.seedConfig.terms.clauses.splice(index, 1);
  }

  async validateInputs(): Promise<string> {
    let message: string;
    this.seedConfig.terms.clauses.forEach((clause, index) => {
      if (!clause.text) {
        message = `Please enter meaningful description to the ${index + 1}. clause`;
      } else if (!clause.tag) {
        message = `Please enter a tag that categorize the ${index + 1}. clause`;
      }
    });
    this.stageState.verified = !message;
    return Promise.resolve(message);
  }

}
