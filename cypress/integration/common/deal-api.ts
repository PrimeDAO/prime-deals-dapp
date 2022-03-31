import { IDealTokenSwapDocument } from "../../../src/entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "../../../src/entities/DealRegistrationTokenSwap";
import { FirestoreService } from "../../../src/services/FirestoreService";
import { E2eNavbar, E2eWallet } from "../tests/wallet.e2e";
import { E2eNavigation } from "./navigate";
import { IFirebaseDocument } from "../../../src/services/FirestoreTypes";
import { MINIMUM_PRIVATE_OPEN_PROPOSAL } from "../../fixtures/dealFixtures";

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
          return !deal.registrationData.partnerDAO;
        });

        if (openProposals.length === 0) {
          throw new Error("[TEST] No Open Proposals found.");
        }

        return openProposals;
      });
    });
  }

  public static getPartneredDeals(options?: IDealOptions) {
    return cy.then(() => {
      return this.getDeals(options).then((deals) => {
        const partneredDeals = deals.filter((deal) => {
          return deal.registrationData.partnerDAO;
        });

        if (partneredDeals.length === 0) {
          throw new Error("[TEST] No Partnered Deals found.");
        }

        return partneredDeals;
      });
    });
  }

  public static getPrivateDeals(options?: IDealOptions) {
    return cy.then(() => {
      return this.getDeals(options).then((deals) => {
        const privateDeals = deals.filter((deal) => {
          return deal.registrationData.isPrivate;
        });

        const shouldCreate = privateDeals.length === 0;
        if (shouldCreate) {
          return this.createDeal(MINIMUM_PRIVATE_OPEN_PROPOSAL).then(createdDeal => {
            return [createdDeal];
          });
        } else {
          return privateDeals;
        }
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
}
