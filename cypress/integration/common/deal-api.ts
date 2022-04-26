import { FirestoreDealsService } from "./../../../src/services/FirestoreDealsService";
import { IDealTokenSwapDocument } from "../../../src/entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "../../../src/entities/DealRegistrationTokenSwap";
import { FirestoreService } from "../../../src/services/FirestoreService";
import { E2eNavbar, E2eWallet } from "../tests/wallet.e2e";
import { E2eNavigation } from "./navigate";
import { IFirebaseDocument } from "../../../src/services/FirestoreTypes";
import { MINIMUM_OPEN_PROPOSAL, PARTNERED_DEAL, PRIVATE_PARTNERED_DEAL } from "../../fixtures/dealFixtures";
import { E2eDeals } from "../tests/deals/deals.e2e";

interface IDealOptions {
  address?: string;
  isLead?: boolean;
}

const defaultDealOptions: IDealOptions = {
  isLead: false,
};

export class E2eDealsApi {
  private static getFirestoreService(): FirestoreService<
  IDealTokenSwapDocument,
  IDealRegistrationTokenSwap
  > {
    // @ts-ignore - Hack to access firestore inside Cypress
    return Cypress.firestoreService;
  }

  private static getDataSourceDeals(): FirestoreDealsService<
  IDealTokenSwapDocument,
  IDealRegistrationTokenSwap
  > {
    // @ts-ignore - Hack to access firestore inside Cypress
    return Cypress.dataSourceDeals;
  }

  public static getDeals(
    options: IDealOptions = defaultDealOptions,
  ): Cypress.Chainable<IDealTokenSwapDocument[]> {
    const { isLead } = options;
    let { address } = options;
    if (address === undefined) {
      address = E2eWallet.currentWalletAddress;
    }

    cy.log("[TEST] Navigate to home page, and wait for app boostrapping");
    /**
     * 1. Auth for Firestore
     * Need to have the app bootstrapped, in order to use firestore
     */
    cy.window().then((window) => {
      const { pathname } = window.location;
      if (!E2eNavigation.isHome(pathname)) {
        E2eNavigation.navigateToHomePage();
      }
      if (address !== undefined && address !== null) {
        E2eNavbar.connectToWallet(address);
      }
    });

    /**
     * 2. Interact with Firestore
     */
    return cy.then(async () => {
      const firestoreService = E2eDealsApi.getFirestoreService();
      const dataSourceDeals = E2eDealsApi.getDataSourceDeals();
      await dataSourceDeals.syncAuthentication(address);

      let deals: IFirebaseDocument<IDealTokenSwapDocument>[];

      if (address === undefined || address === null) {
        deals = await firestoreService.getAllPublicDeals();
      } else if (isLead) {
        deals = await firestoreService.getProposalLeadDeals(address);
      } else {
        deals = await firestoreService.getAllDealsForTheUser(address);
      }

      return deals.map((deal) => deal.data);
    });
  }

  public static getOpenProposals(options?: IDealOptions) {
    return cy.then(() => {
      return this.getDeals(options).then((deals) => {
        const openProposals = deals.filter((deal) => {
          const hasNoPartner = !deal.registrationData.partnerDAO;
          const notPrivate = !deal.registrationData.isPrivate;
          const isOpen = hasNoPartner && notPrivate;
          return isOpen;
        });

        return this.getOrCreateDeal(openProposals, MINIMUM_OPEN_PROPOSAL);
      });
    });
  }

  public static getPartneredDeals(options?: IDealOptions) {
    return cy.then(() => {
      return this.getDeals(options).then((deals) => {
        const partneredDeals = deals.filter((deal) => {
          return deal.registrationData.partnerDAO;
        });

        return this.getOrCreateDeal(partneredDeals, PARTNERED_DEAL);
      });
    });
  }

  public static getPrivateDeals(options?: IDealOptions) {
    return cy.then(() => {
      return this.getDeals(options).then((deals) => {
        const privateDeals = deals.filter((deal) => {
          return deal.registrationData.isPrivate;
        });

        return this.getOrCreateDeal(privateDeals, PRIVATE_PARTNERED_DEAL);
      });
    });
  }

  public static getFirstOpenProposalId(options?: IDealOptions) {
    return cy.then(() => {
      return this.getOpenProposals(options).then((openProposals) => {
        return openProposals[0].id;
      });
    });
  }

  public static getFirstPartneredDealId(options?: IDealOptions) {
    return cy.then(() => {
      return this.getPartneredDeals(options).then((partneredDeals) => {
        return partneredDeals[0].id;
      });
    });
  }

  public static getFirstPrivateDealId(options?: IDealOptions) {
    return cy.then(() => {
      return this.getPrivateDeals(options).then((privateDeals) => {
        return privateDeals[0].id;
      });
    });
  }

  /**
   * Either: (via FirestoreService)
   * 1. Init app bootstrapping and create a Deal
   * 2. Just create a Deal
   *
   * Then set it to E2eDeals (for further testing usage)
   */
  public static createDeal(
    registrationData: IDealRegistrationTokenSwap,
    options: IDealOptions = defaultDealOptions,
  ) {
    cy.log("createDeal");

    let { address } = options;
    if (address === undefined) {
      address = E2eWallet.currentWalletAddress;
    }

    /**
     * 1. Auth for Firestore
     * Need to have the app bootstrapped, in order to use firestore
     */
    return cy.window().then((window) => {
      const { pathname } = window.location;
      if (!E2eNavigation.isHome(pathname)) {
        cy.log("[TEST] Navigate to home page, and wait for app boostrapping");
        E2eNavigation.navigateToHomePage();
      }
      if (address !== undefined) {
        E2eNavbar.connectToWallet(address);
      }

      /**
       * 2. Interact with Firestore
       */
      return cy.then(async () => {
        const firestoreService = E2eDealsApi.getFirestoreService();

        const createdDeal = await firestoreService.createDealTokenSwap(registrationData);

        E2eDeals.setDeal(createdDeal);

        return createdDeal;
      });
    });
  }

  private static getOrCreateDeal(existingDeals: IDealTokenSwapDocument[], newDeal: IDealRegistrationTokenSwap) {
    return cy.then(() => {
      if (existingDeals.length === 0) {
        return this.createDeal(newDeal).then(createdDeal => {
          cy.log(`Created deal with title: ${createdDeal.registrationData.proposal.title}`);
          E2eDeals.setDeal(createdDeal);

          return [createdDeal];
        });
      } else if (E2eDeals.currentDealId) {
        const targetDeal = existingDeals.find(deal => deal.id === E2eDeals.currentDealId);
        cy.log(`Getting existing deal with title: ${targetDeal.registrationData.proposal.title}`);
        return cy.then(() => {
          return [targetDeal];
        });
      } else {
        cy.log(`Getting existing deals. Amount: ${existingDeals.length}`);
        return cy.then(() => {
          return existingDeals;
        });
      }
    });
  }
}
