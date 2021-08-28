import { Router } from "aurelia-router";
import { autoinject } from "aurelia-framework";
import "./initiate.scss";

interface IBoxes {
  name: string,
  slug: string,
  isDisabled: boolean,
  slot: string,
}

@autoinject
export class Initiate {
  boxes: IBoxes[] = [
    {
      name: "Joint Venture",
      slug: "joint-venture",
      isDisabled: true,
      slot: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat.",
    },
    {
      name: "Token Swap",
      slug: "token-swap",
      isDisabled: false,
      slot: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat.",
    },
  ];

  constructor(private router: Router) { }

  navigate(href: string, args): void {
    this.router.navigateToRoute(href, args);
  }
}
