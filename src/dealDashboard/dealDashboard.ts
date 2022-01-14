import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { DateService } from "services/DateService";
import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import "./dealDashboard.scss";
import { DiscussionsService } from "./discussionsService";

export interface IClause {
  description: string,
  discussionThread: {
    threadId: string,
    creator: string,
    createdAt: Date,
  }
}

@autoinject
export class DealDashboard {
  // loading = true;
  connected = false;
  private router: Router;
  private routeChangeEvent: Subscription;
  private activeClause = "";

  // TODO: get from a service
  dealClauses: Array<IClause> = [
    {
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
      discussionThread: {
        threadId: "0x891ac160551a35b586b7e304aac9287904773bd7047388111ceefac5d3a108bc",
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
    },
    {
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Ut enim ad minim veniam, quis nostr",
      discussionThread: {
        threadId: "0xae506662f1b14ab626da1df812f43ecffb9fbae37c43a43b42263b3d89494958",
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
      },
    },
    {
      description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      discussionThread: {
        threadId: "0x54d1c476fe9997e6ad758cc8ca32160f5deef3fbc4e57f747f433978af8a0c11",
        creator: "John Doe",
        createdAt: new Date(2022, 0, 2),
      },
    },
    {
      description: "Culpa qui officia deserunt mollit anim id est laborum.",
      discussionThread: {
        threadId: undefined,
        creator: "John Doe",
        createdAt: new Date(2022, 0, 2),
      },
    },
    {
      description: "Excepteur sint occaecat cupidatat id est laborum.",
      discussionThread: {
        threadId: undefined,
        creator: "John Doe",
        createdAt: new Date(2022, 0, 2),
      },
    },
  ];

  constructor(
    private ethereumService: EthereumService,
    private dateService: DateService,
    private discussionsService: DiscussionsService,
    private eventAggregator: EventAggregator,
  ) {
    this.connected = !!this.ethereumService.defaultAccountAddress;
  }

  activate(_, __, navigationInstruction) {
    this.setThreadIdFromRoute(navigationInstruction);

    this.routeChangeEvent = this.eventAggregator.subscribe("router:navigation:complete", (response) => {
      this.setThreadIdFromRoute(response.instruction);
    });
  }

  deactivate() {
    this.routeChangeEvent.dispose();
  }

  private setThreadIdFromRoute(navigationInstruction): void {
    const currentRoute = navigationInstruction.params.childRoute;
    if (currentRoute && currentRoute.includes("/")) {
      this.activeClause = navigationInstruction.params.childRoute.split("/")[1];
    } else {
      this.activeClause = "";
    }
  }
  private addDiscussion = async (topic: string, id: string): Promise<boolean> => {
    this.activeClause = await this.discussionsService.createDiscussion(topic);
    this.dealClauses[id].discussionThread.threadId = this.activeClause;

    this.router.navigate(`thread/${this.activeClause}` );
    return true;
  };

  private configureRouter(config: RouterConfiguration, router: Router): void {
    const routes = [
      {
        route: [""],
        nav: true,
        moduleId: PLATFORM.moduleName("./discussionsList/discussionsList"),
        name: "discussions-list",
        title: "Discussions",
      },
      {
        route: ["thread"],
        href: "thread/:threadId",
        nav: true,
        moduleId: PLATFORM.moduleName("./dealThread/dealThread"),
        name: "deal-thread",
        title: "Thread",
      },

    ];

    config.map(routes);

    this.router = router;
  }
}
