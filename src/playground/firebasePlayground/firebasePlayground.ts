/* eslint-disable no-console */
import { autoinject } from "aurelia-framework";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Subscription } from "rxjs";
import { FirestoreService } from "./../../services/FirestoreService";
import { openProposalDummyData1, partnerDealDummyData1 } from "./firebaseDummyData";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { IEthereumService } from "services/IEthereumService";

@autoinject
export class FirebasePlayground {
  allDeals: any[] = [];
  subscriptions: Array<Subscription> = [];

  constructor(
    private firestoreService: FirestoreService<IDealTokenSwapDocument, IDealRegistrationTokenSwap>,
    private ethereumService: IEthereumService,
  ) {}

  async attached() {
    this.subscriptions.push(
      this.firestoreService.subscribeToAllDealsForUser()
        .subscribe(
          deals => {
            this.allDeals = deals;
            console.log("All deals for user", deals);
          },
          error => {
            console.log("error", error);
          },
        ),
    );
  }

  detached() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  vote(dealId: string, address: string, dao: "PRIMARY_DAO" | "PARTNER_DAO", value: boolean) {
    this.firestoreService.updateRepresentativeVote(dealId, address, dao, value);
  }

  createOpenProposal() {
    this.firestoreService.createDealTokenSwap(openProposalDummyData1);
  }

  createPartneredDeal() {
    this.firestoreService.createDealTokenSwap(partnerDealDummyData1);
  }

  updateDealRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    this.firestoreService.updateTokenSwapRegistrationData(dealId, registrationData);
  }

  addClauseDiscussion(dealId: string, clauseId: string, discussionHash: string) {
    this.firestoreService.addClauseDiscussion(dealId, clauseId, discussionHash);
  }

  async updateDealIsWithdrawn(dealId: string, value: boolean) {
    try {
      await this.firestoreService.updateDealIsWithdrawn(dealId, value);
    } catch (error){
      console.error(error);
    }
  }

  async updateDealIsRejected(dealId: string, value: boolean) {
    try {
      await this.firestoreService.updateDealIsRejected(dealId, value);
    } catch (error){
      console.error(error);
    }
  }

  async getDealById(dealId: string) {
    try {
      const deal = await this.firestoreService.getDealById(dealId);
      console.log(deal);
    } catch (error){
      console.error(error);
    }
  }

  async getAllPublicDeals() {
    try {
      const deals = await this.firestoreService.getAllPublicDeals();
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getRepresentativeDeals() {
    try {
      const deals = await this.firestoreService.getRepresentativeDeals(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getProposalLeadDeals() {
    try {
      const deals = await this.firestoreService.getProposalLeadDeals(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async getAllDealsForTheUser() {
    try {
      const deals = await this.firestoreService.getAllDealsForTheUser(this.ethereumService.defaultAccountAddress);
      console.log(deals);
    } catch (error) {
      console.error(error);
    }
  }

  async updateDealTitle(dealId: string, title: string) {
    const registrationData = this.allDeals.find(deal => deal.id === dealId).data.registrationData;
    registrationData.proposal.title = title;
    registrationData.partnerDAO = registrationData.partnerDAO ? registrationData.partnerDAO : null;
    await this.firestoreService.updateTokenSwapRegistrationData(dealId, registrationData);
  }
}
