import { IDealTypeBox } from "./dealTypeSelector/dealTypeSelector";
import "./initiate.scss";

export class Initiate {
  boxes: IDealTypeBox[] = [
    {
      name: "Token Swap",
      slug: "initiate/token-swap",
      isDisabled: false,
      description: "Safely exchange tokens between multiple parties with customized vesting schedules.",
      specialContent: `
        <div class="fee-info">
          <div class="title">0.3% FEE</div>
          <div class="description">Collected in native tokens if successful</div>
        </div>
      `,
    },
    {
      name: "Co-liquidity",
      slug: "co-liquidity",
      isDisabled: true,
      description: "Seed or join into a liquidity pool together with multiple parties.",
    },
  ];
}
