import { autoinject } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { EthereumService } from "services/EthereumService";
import { DiscussionsService } from "./discussionsService";
import "./dealDashboard.scss";

export interface IDealConfig {
  isPrivate: boolean,
  isPublicReadOnly: boolean,
  members: Array<string>,
  admins: Array<string>,
  clauses: Array<IClause>,
}
export interface IClause {
  description: string,
  // discussionThread: {
  //   threadId?: string,
  //   creator: string,
  //   createdAt: Date,
  // }
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
      {
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
        // discussionThread: {
        //   creator: "John Doe",
        //   createdAt: new Date(2022, 0, 1),
        // },
      },
      {
        description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
        // discussionThread: {
        //   creator: "John Doe",
        //   createdAt: new Date(2022, 0, 1),
        // },
      },
      {
        description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        // discussionThread: {
        //   creator: "John Doe",
        //   createdAt: new Date(2022, 0, 2),
        // },
      },
      {
        description: "Culpa qui officia deserunt mollit anim id est laborum.",
        // discussionThread: {
        //   creator: "John Doe",
        //   createdAt: new Date(2022, 0, 2),
        // },
      },
      {
        description: "Excepteur sint occaecat cupidatat id est laborum.",
        // discussionThread: {
        //   creator: "John Doe",
        //   createdAt: new Date(2022, 0, 2),
        // },
      },
    ],
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
