import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { bindable } from "aurelia-typed-observable-plugin";
// import { Seed } from "entities/Seed";
import { Address } from "services/EthereumService";
import { SeedService } from "services/SeedService";
import "./dealSummary.scss";

@autoinject
export class DealSummary {

  @bindable address: Address;
  @bindable name: string;
  @bindable logo: string;
  @bindable seed: any;
  // seed: Seed;
  loading = true;
  container: HTMLElement;

  constructor(
    private router: Router,
    private seedService: SeedService,
  ) {}

  async attached(): Promise<void> {
    // await this.seedService.ensureInitialized();
    // this.seed = this.seedService.seeds.get(this.address);
    this.loading = false;
  }
}
