import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

  constructor(
    private router: Router,
  ) {
  }

  private goto(fragment: string) {
    this.router.navigate(fragment);
  }
}
