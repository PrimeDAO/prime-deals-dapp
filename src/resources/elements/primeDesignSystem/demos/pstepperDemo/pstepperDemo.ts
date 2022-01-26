/* eslint-disable no-console */
import { IStepperStep } from "../../types";

export class PStepper {
  steps1: IStepperStep[] = [{
    name: "First",
    valid: false,
  }, {
    name: "Second",
    valid: false,
  }, {
    name: "Third",
    valid: false,
  }];
  indexOfActive1 = 0;
  onClick1(index): void {
    console.log("Example1 clicked index: ", index);
    this.indexOfActive1 = index;
  }
  stage1 = `
    <pstepper
      steps.bind="steps1"
      index-of-active.bind="indexOfActive1"
      on-click.call="onClick1(index)">
    </pstepper>
  `;

  steps2: IStepperStep[] = [{
    name: "First2",
    valid: false,
  }, {
    name: "Second2",
    valid: false,
  }, {
    name: "Third2",
    valid: false,
  }];
  indexOfActive2 = 0;
  onClick2(index) {
    console.log("Example2 clicked index: ", index);
    this.steps2[this.indexOfActive2].valid = true;
    this.indexOfActive2 = index;
  }
  stage2 = `
    <pstepper
      steps.bind="steps2"
      index-of-active.bind="indexOfActive2"
      on-click.call="onClick2(index)">
    </pstepper>
  `;

  steps3: IStepperStep[] = [{
    name: "First3",
    valid: true,
  }, {
    name: "Second3",
    valid: false,
  }, {
    name: "Third3",
    valid: false,
  }];
  indexOfActive3 = 0;
  onClick3(index) {
    console.log("Example3 clicked index: ", index);
    if (index === 0 || index === 1 ) {
      this.indexOfActive3 = index;
    }
  }
  stage3 = `
    <pstepper
      steps.bind="steps3"
      index-of-active.bind="indexOfActive3"
      on-click.call="onClick3(index)">
    </pstepper>
  `;
}
