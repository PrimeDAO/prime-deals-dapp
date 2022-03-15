import "./funding.scss";

import { ContractNames, ContractsService } from "services/ContractsService";

import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EthereumService } from "services/EthereumService";
import {Router} from "aurelia-router";
import { Utils } from "services/utils";
import {autoinject} from "aurelia-framework";

@autoinject
export class Funding {
  private dealId: string;
  private deal: DealTokenSwap;
  private isProposalLead = false;
  constructor(
    private router: Router,
    private readonly dealService: DealService,
    private ethereumService: EthereumService,
    private contractsService: ContractsService,
  ) {}

  async canActivate(){
    await Utils.waitUntilTrue(() => !!this.ethereumService.defaultAccountAddress, 5000);
  }

  async activate(_, __, navigationInstruction) {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
    if (!this.deal.registrationData.primaryDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
            !this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
            this.ethereumService.defaultAccountAddress !== this.deal.registrationData.proposalLead.address
    ){
      //redirect user to the home page if not the proposal lead or one of the deal's representatives
      this.router.navigate("home");
    }
    if (this.ethereumService.defaultAccountAddress === this.deal.registrationData.proposalLead.address){
      this.isProposalLead = true;
    }

    const baseContract = await this.contractsService.getContractFor(ContractNames.BASECONTRACT);
    console.log("Primary DAO Address", this.deal.registrationData.primaryDAO.treasury_address);
    console.log("Partner DAO Address", this.deal.registrationData.partnerDAO.treasury_address);
    const primaryDaoContractAddress = await baseContract.getDepositContract(this.deal.registrationData.primaryDAO.treasury_address);
    const partnerDaoContractAddress = await baseContract.getDepositContract(this.deal.registrationData.partnerDAO.treasury_address);
    //const primaryDao = this.contractsService.getContractAtAddress(ContractNames.BASECONTRACT, this.deal.registrationData.primaryDAO.treasury_address);
    console.log(baseContract);
    console.log(primaryDaoContractAddress);
    console.log(partnerDaoContractAddress);
  }

  /**
   * Gets the DAO Name of the connected wallet address
   */
  private getDaoNameRelatedToWallet(): string{
    if (this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress)){
      return this.deal.registrationData.partnerDAO.name;
    }
    return this.deal.registrationData.primaryDAO.name;
  }

  /**
   * Navigates user to the deal page by id
   */
  private goToDealPage(): void {
    this.router.navigate("deal/" + this.dealId);
  }

  private getTimeLeft(): string{
    return "5 days";
  }
}
