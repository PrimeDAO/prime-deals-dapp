import "./initiate.scss";

interface IBoxes {
  name: string
  slug: string
  isDisabled: boolean
}

export class Initiate {
  box: IBoxes[] = [
    {
      name: "Joint Venture",
      slug: "joint-venture",
      isDisabled: true,
    },
    {
      name: "Token Swap",
      slug: "token-swap",
      isDisabled: false,
    },
  ];
}

