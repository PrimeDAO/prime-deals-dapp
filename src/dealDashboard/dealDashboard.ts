import { autoinject, computedFrom } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { DealService } from "services/DealService";
import { EthereumService, Address } from "services/EthereumService";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { IDealDiscussion } from "entities/DealDiscussions";
import "./dealDashboard.scss";

@autoinject
export class DealDashboard {
  // loading = true;
  private connected = false;
  private accountAddress: Address;

  private routeChangeEvent: Subscription;

  private dealId: string;
  private deal: DealTokenSwap;

  private clauses: IClause[];
  private activeClause: string;

  private discussions: IDealDiscussion;

  @computedFrom("ethereumService.defaultAccountAddress", "deal.registrationData")
  get authorized(): boolean {
    return !this.deal.registrationData.isPrivate ||
      (
        this.ethereumService.defaultAccountAddress &&
        [
          this.deal.registrationData.proposalLead?.address,
          ...this.deal.registrationData.primaryDAO?.members || "",
          ...this.deal.registrationData.partnerDAO?.members || "",
        ].includes(this.ethereumService.defaultAccountAddress)
      );
  }

  constructor(
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
    private eventAggregator: EventAggregator,
    private router: Router,
    private dealService: DealService,
  ) {
    this.accountAddress = "";
    this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
      if (account !== this.accountAddress) {
        this.accountAddress = account;
      }
    });
  }

  async activate(_, __, navigationInstruction) {
    this.setThreadIdFromRoute(navigationInstruction);
    this.routeChangeEvent = this.eventAggregator.subscribe("router:navigation:complete", (response) => {
      this.setThreadIdFromRoute(response.instruction);
    });

    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
    this.clauses = this.deal.registrationData.terms.clauses;
  }

  deactivate() {
    this.routeChangeEvent.dispose();
  }

  accountAddressChanged(newAddress: Address){
    console.log({newAddress});

    this.connected = this.deal && ([
      this.deal.registrationData.proposalLead,
      ...this.deal.registrationData.primaryDAO.members,
      ...this.deal.registrationData.partnerDAO.members,
    ].includes(newAddress));
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
  private addOrReadDiscussion = async (topic: string, hash: string, id: number | null = null): Promise<void> => {
    const discussionId = await this.discussionsService.createDiscussion(
      this.dealId,
      {
        discussionId: hash,
        topic,
        clauseId: id,
        admins: [this.ethereumService.defaultAccountAddress],
        members: [this.ethereumService.defaultAccountAddress],
        isPublic: true,
      },
    );

    if (discussionId !== null) {
      this.router.navigate(`discussion/${discussionId}`, { replace: true, trigger: true });
    }
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
