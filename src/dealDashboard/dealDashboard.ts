// import { Router } from "aurelia-router";
import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DateService } from "services/DateService";
import "./dealDashboard.scss";

export interface IClause {
  id: string,
  text: string,
  discussionThread: {
    creator: string,
    createdAt: Date,
  }
}

@autoinject
export class DealDashboard {
  loading = true;
  connected = false;

  // TODO: get from a service
  dealClauses: Array<IClause> = [
    {
      id: "1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
      discussionThread: {
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
      // replies: 2,
      // lastActivity: Math.floor(this.dateService.getDurationBetween(new Date(), new Date(2022, 0, 2)).asDays()),
    },
    {
      id: "2",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
      discussionThread: {
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
    },
    {
      id: "3",
      text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      discussionThread: {
        creator: "John Doe",
        createdAt: new Date(2022, 0, 2),
      },
    },
    {
      id: "4",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
      discussionThread: {
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
    },
    {
      id: "5",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      discussionThread: {
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
    },
  ]

  constructor(
    private ethereumService: EthereumService,
    private dateService: DateService,
  ) {
    this.connected = !!this.ethereumService.defaultAccountAddress;
  }
}
