import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";
import { EthereumService } from "../../services/EthereumService";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

  constructor(
    private router: Router,
    public ethereumService: EthereumService,
  ) {
  }

  private goto(fragment: string) {
    this.router.navigate(fragment);
  }
}
