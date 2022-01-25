import { autoinject } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { EthereumService } from "services/EthereumService";
import { DiscussionsService, IDiscussion } from "dealDashboard/discussionsService";
import "./dealDashboard.scss";

export interface IDealConfig {
  isPrivate: boolean,
  isPublicReadOnly: boolean,
  members: string[],
  admins: string[],
  clauses: string[],
  discussions: { [key: string]: IDiscussion },
}

@autoinject
export class DealDashboard {
  // loading = true;
  connected = false;
  private routeChangeEvent: Subscription;
  private activeClause: string;

  // TODO: get from a service
  private dealConfig: IDealConfig = {
    isPrivate: false,
    isPublicReadOnly: false,
    members: [process.env.WALLET], // temporary
    admins: [process.env.WALLET], // temporary
    clauses: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Culpa qui officia deserunt mollit anim id est laborum.",
      "Excepteur sint occaecat cupidatat id est laborum.",
    ],
    discussions: {
      "3b39cab51d207ad9f77e1ee4083337b00bbc707f": {
        "topic": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
        "clauseId": 0,
        "admins": [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        "members": [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        "isPublic": true,
        "createdBy": "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        "createdOn": new Date("2022-01-23T15:38:16.528Z"),
        "replies": 6,
        "lastActivity": new Date(1643031030746),
      },
      "e853c854c6bafac799eea13582d6bd41fa6c0fd5": {
        "topic": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
        "clauseId": 1,
        "admins": [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        "members": [
          "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        ],
        "isPublic": true,
        "createdBy": "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F",
        "createdOn": new Date("2022-01-21T15:48:32.753Z"),
        "replies": 10,
        "lastActivity": new Date(1642846275332),
      },
      "0adcb114f1cd5f39e88e67c9b85424b9d4d9e766": {
        "topic": "Excepteur sint occaecat cupidatat id est laborum.",
        "clauseId": 4,
        "admins": [
          "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        ],
        "members": [
          "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        ],
        "isPublic": true,
        "createdBy": "0xd5804F7B89f26efeaB13440BA92A8AF3f5fCcE9b",
        "createdOn": new Date("2022-01-22T20:57:43.707Z"),
        "replies": 0,
        "lastActivity": null,
      },
    },
  };

  private dealId: string;

  constructor(
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
    private eventAggregator: EventAggregator,
    private router: Router,
  ) {
    this.connected = !!this.ethereumService.defaultAccountAddress;
  }

  activate(_, __, navigationInstruction) {
    this.setThreadIdFromRoute(navigationInstruction);
    this.routeChangeEvent = this.eventAggregator.subscribe("router:navigation:complete", (response) => {
      this.setThreadIdFromRoute(response.instruction);
    });

    this.dealId = navigationInstruction.params.address;

    if (!localStorage.getItem("discussions")) {
      localStorage.setItem("discussions", JSON.stringify(this.dealConfig.discussions));
    }
    this.discussionsService.getDiscussions();
  }

  deactivate() {
    this.routeChangeEvent.dispose();
  }

  private setThreadIdFromRoute(navigationInstruction): void {
    const currentRoute = navigationInstruction.params.childRoute;
    if (currentRoute && currentRoute.includes("/")) {
      this.activeClause = navigationInstruction.params.childRoute.split("/")[1];
    } else {
      this.activeClause = undefined;
    }
  }

  /**
   * Adds a new discussion thread to the deal
   * (Currently saves the thread to the local storage- this should be replaced with a data-storage call)
   *
   * @param topic the discussion topic
   * @param id the id of the clause the discussion is for or null if it is a general discussion
   */
  private addDiscussion = async (topic: string, id: number | null = null): Promise<void> => {
    const threadId = await this.discussionsService.createDiscussion({
      topic,
      clauseId: id,
      admins: [this.ethereumService.defaultAccountAddress],
      members: [this.ethereumService.defaultAccountAddress],
      isPublic: true});

    this.router.navigate(`discussion/${threadId}`, { replace: true, trigger: true });
  };

  private configureRouter(config: RouterConfiguration, router: Router): void {
    const routes: RouteConfig[] = [
      {
        route: "",
        nav: false,
        moduleId: PLATFORM.moduleName("./discussionsList/discussionsList"),
        name: "discussions-list",
        title: "Discussions",
      },
      {
        route: "discussion",
        nav: false,
        redirect: "",
      },
      {
        route: "discussion/:discussionId",
        nav: false,
        moduleId: PLATFORM.moduleName("./discussionThread/discussionThread"),
        name: "discussion-thread",
        title: "Discussion",
        /**
         * activationStrategy is needed here in order to refresh the
         * route if the user clicks on a different clause without going
         * back to the list first
         *  */
        activationStrategy: "replace",
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
