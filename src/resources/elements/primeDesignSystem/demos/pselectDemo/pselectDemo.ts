import { bindable } from "aurelia-framework";
import "./pselectDemo.scss";

/**
 */
export class pSelectDemo {
  @bindable simpleData = [
    {
      text: "Option 1",
      value: "1",
    },
    {
      text: "Option 2",
      value: "2",
    },
    {
      text: "Option 3",
      value: "3",
    },
    {
      text: "Option 4",
      value: "4",
    },
    {
      text: "Option 5",
      value: "5",
    },
    {
      text: "Option 6",
      value: "6",
    },
    {
      text: "Option 7",
      value: "7",
    },
  ];
  @bindable complexData;

  attached(): void {
    setTimeout(() => {
      this.complexData = [
        {
          text: "Option 1",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 1</span>",
          value: "1",
        },
        {
          text: "Option 2",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 2</span>",
          value: "2",
        },
        {
          text: "Option 3",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 3</span>",
          value: "3",
        },
        {
          text: "Option 4",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 4</span>",
          value: "4",
        },
        {
          text: "Option 5",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 5</span>",
          value: "5",
        },
        {
          text: "Option 6",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 6</span>",
          value: "6",
        },
        {
          text: "Option 7",
          innerHTML: "<span><i class=\"fas fa-ice-cream\"></i> Option 7</span>",
          value: "7",
        },
      ];
    }, 3000);
  }
}
