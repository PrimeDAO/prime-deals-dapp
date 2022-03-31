import { IDealTokenSwapDocument } from "../../../src/entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "../../../src/entities/DealRegistrationTokenSwap";
import { FirestoreService } from "../../../src/services/FirestoreService";
import { E2eNavbar, E2eWallet } from "../tests/wallet.e2e";
import { E2eNavigation } from "./navigate";
import { IFirebaseDocument } from "../../../src/services/FirestoreTypes";
import { MINIMUM_OPEN_PROPOSAL, MINIMUM_PRIVATE_OPEN_PROPOSAL, PARTNERED_DEAL } from "../../fixtures/dealFixtures";

interface IDealOptions {
  address?: string;
  isLead?: boolean;
}

const defaultDealOptions: IDealOptions = {
  isLead: false,
};

export class E2eDealsApi {
  private static getDealService(): FirestoreService<
  IDealTokenSwapDocument,
  IDealRegistrationTokenSwap
  > {
    // @ts-ignore - Hack to access firestore inside Cypress
    return Cypress.firestoreService;
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
      if (address !== undefined) {
        E2eNavbar.connectToWallet(address);
      }
    });

    /**
     * 2. Interact with Firestore
     */
    return cy.then(async () => {
      const firestoreDealsService = E2eDealsApi.getDealService();
      await firestoreDealsService.ensureAuthenticationIsSynced();

      let deals: IFirebaseDocument<IDealTokenSwapDocument>[];

      if (address === undefined) {
        deals = await firestoreDealsService.getAllPublicDeals();
      } else if (isLead) {
        deals = await firestoreDealsService.getProposalLeadDeals(address);
      } else {
        deals = await firestoreDealsService.getAllDealsForTheUser(address);
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

        return this.getOrCreateDeal(privateDeals, MINIMUM_PRIVATE_OPEN_PROPOSAL);
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
        const firestoreDealsService = E2eDealsApi.getDealService();
        await firestoreDealsService.ensureAuthenticationIsSynced();

        const createdDeal = await firestoreDealsService.createDealTokenSwap(registrationData);
        return createdDeal;
      });
    });
  }

  private static getOrCreateDeal(existingDeals: IDealTokenSwapDocument[], newDeal: IDealRegistrationTokenSwap) {
    return cy.then(() => {
      if (existingDeals.length === 0) {
        return this.createDeal(newDeal).then(createdDeal => {
          return [createdDeal];
        });
      } else {
        return existingDeals;
      }
    });
  }
}
