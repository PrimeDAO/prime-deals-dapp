/* eslint-disable no-console */
import { IDealDiscussion } from "entities/DealDiscussions";
import { EthereumService } from "./../../services/EthereumService";
import { autoinject } from "aurelia-framework";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Subscription } from "rxjs";
import { FirestoreService } from "./../../services/FirestoreService";
import { openProposalDummyData1, partnerDealDummyData1 } from "./firebaseDummyData";
import { IDealTokenSwapDocument } from "entities/IDealTypes";

@autoinject
export class FirebasePlayground {
  allDeals: any[] = [];
  subscriptions: Array<Subscription> = [];

  constructor(
    private firestoreService: FirestoreService<IDealTokenSwapDocument, IDealRegistrationTokenSwap>,
    private ethereumService: EthereumService,
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

  addDealDiscussion(dealId: string, clauseIndex: number) {
    const discussion: IDealDiscussion = {
      dealId,
      version: "0.0.1",
      discussionId: new Date().toISOString(),
      topic: "Topic",
      clauseIndex,
      createdBy: {
        address: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
      },
      clauseId: "asd",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      replies: 0,
      representatives: [{
        address: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
      }],
      admins: [{
        address: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
      }],
      key: new Date().toISOString(),
    };
    this.firestoreService.addClauseDiscussion(dealId, `${clauseIndex}`, discussion);
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
