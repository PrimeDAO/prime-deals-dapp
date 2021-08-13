import { BaseStage } from "./baseStage";

export class Stage1 extends BaseStage {
  validateInputs(): Promise<string> {
    let message: string;
    if (!this.seedConfig.proposal.name) {
      message = "Please enter a name for your proposal";
    }
    else if (this.seedConfig.proposal.overview.length<5) {
      message = "Please enter a descriptive overview for your proposal";
    }
    this.stageState.verified = !message;
    return Promise.resolve(message);
  }
}
