import { customElement } from "aurelia-framework";
import "./pinput-group.scss";
import { Controller, View } from "aurelia-templating";

interface AureliaSlot {
  projections: number
}

type AureliaElement = Element & {
  au: {
    controller: Controller & {
      view: View & {
        slots: Record<string, AureliaSlot>
      }
    }
  }
}

@customElement("pinput-group")
export class PInputGroup {
  element: Element;
  $slots: Record<string, AureliaSlot>;

  constructor(element: Element) {
    this.element = element;
  }

  attached() {
    // Unfortunately, Aurelia does not have any official docs on how to get all the used slots in a component,
    //  so we have to get them using some javascript properties that exist on the element itself.
    // To make Typescript happy, we had to define our own Element type
    //  that is not defined in Aurelia's typescript definitions.
    //  This type correctly defines the existing properties present in HTML elements.
    const element = this.element as unknown as AureliaElement
    this.$slots = element.au.controller.view.slots;
    console.log(this.$slots);
  }
}
