import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./initiate.scss";
@autoinject
export class Initiate {
  constructor(private router: Router) { }

  navigate(slug: string): void {
    this.router.navigate(slug);
  }
}
