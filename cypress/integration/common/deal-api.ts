import { IDealTokenSwapDocument } from "../../../src/entities/IDealTypes";
import { E2eWallet } from "../tests/wallet.e2e";
import { E2eNavigation } from "./navigate";

export class E2eDealsApi {
  private static getDealService() {
    // @ts-ignore - Hack to access firestore inside Cypress
    return Cypress.firestoreDealsService;
  }

  public static getDeals(
    address: string,
  ): Cypress.Chainable<IDealTokenSwapDocument[]> {
    cy.log("[Test] Navigate to home page, and wait for app boostrapping");
    /**
     * Need to have the app bootstrapped, in order to use firestore
     */
    E2eNavigation.navigateToHomePage();

    return cy.then(async () => {
      const firestoreDealsService = E2eDealsApi.getDealService();
      const deals = await firestoreDealsService.getDeals(address);
      return deals;
    });
  }

  public static getOpenProposals(address: string) {
    return cy.then(() => {
      return this.getDeals(address).then((deals) => {
        return deals.filter((deal) => {
          return !deal.registrationData.partnerDAO;
        });
      });
    });
  }

  public static getPartneredDeals(address: string) {
    return cy.then(() => {
      return this.getDeals(address).then((deals) => {
        return deals.filter((deal) => {
          return deal.registrationData.partnerDAO;
        });
      });
    });
  }

  public static getFirstOpenProposalId(
    address: string = E2eWallet.currentWalletAddress,
  ) {
    return cy.then(() => {
      return this.getOpenProposals(address).then((openProposals) => {
        const id = openProposals[0].id;
        if (id === undefined) {
          throw new Error("[TEST] No Open Proposal found");
        }

        return id;
      });
    });
  }

  public static getFirstPartneredDealId(
    address: string = E2eWallet.currentWalletAddress,
  ) {
    return cy.then(() => {
      return this.getPartneredDeals(address).then((partneredDeals) => {
        const id = partneredDeals[0].id;
        if (id === undefined) {
          throw new Error("[TEST] No Open Proposal found");
        }

        return id;
      });
    });
  }
}
