// import { BigNumber } from "ethers";
import { autoinject } from "aurelia-framework";
// import { bindable } from "aurelia-typed-observable-plugin";
import { BaseStage } from "registry-wizard/baseStage";
// import { Utils } from "services/utils";
// import { Router } from "aurelia-router";
// import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class Stage3 extends BaseStage {
  private period: HTMLInputElement;

  public attached(): void {
    this.period.addEventListener("keydown", (e) => { this.keydown(e); });
    this.period.addEventListener("keyup", (e) => { this.keyup(e); });
  }

  async detached(): Promise<void> {
    if (this.period) {
      this.period.removeEventListener("keydown", (e) => { this.keydown(e); });
      this.period.removeEventListener("keyup", (e) => { this.keyup(e); });
    }
  }

  // http://stackoverflow.com/a/995193/725866
  private isNavigationOrSelectionKey(e): boolean {
    // Allow: backspace, delete, tab, escape, enter and .
    let returnValue = false;
    if (
      ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1) ||
      // Allow: Ctrl+A/X/C/V, Command+A/X/C/V
      (([65, 67, 86, 88].indexOf(e.keyCode) !== -1) && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
      // let it happen, don't do anything
      returnValue = true;
    }
    return returnValue;
  }

  private keydown(e) {
    if (!this.isNavigationOrSelectionKey(e)) {
      // If it's not a number, prevent the keypress...
      // if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      if (!(e.keyCode >= 48 && e.keyCode <= 57)) {
        e.preventDefault();
      } else if (e.target.value.length >= 3) {
        e.preventDefault();
      } else if (e.target.value.length === 0 && e.keyCode === 48) {
        e.preventDefault();
      }
    }
  }

  private keyup(e) {
    const inp = Array.from(new Set(e.target.value));
    if (inp.length === 1 && inp[0] === "0") {
      e.target.value = "";
    }
  }

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
    if (!message) {
      if (this.seedConfig.terms.period < 1) {message ="Negotiation period must be at least one day";}
      if (this.seedConfig.terms.period > 999) {message ="The maximal Negotiation period can not exceed 999 days.";}
    }
    this.stageState.verified = !message;
    return Promise.resolve(message);
  }

}
