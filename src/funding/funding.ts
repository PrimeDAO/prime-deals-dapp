import { BigNumber } from "ethers";
import { EthweiValueConverter } from "./../resources/value-converters/ethwei";
import "./funding.scss";

import { ContractNames, ContractsService } from "services/ContractsService";

import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EthereumService } from "services/EthereumService";
import {Router} from "aurelia-router";
import { Utils } from "services/utils";
import {autoinject} from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { ITokenFunding } from "entities/TokenFunding";
import { IPSelectItemConfig } from "resources/elements/primeDesignSystem/pselect/pselect";
import { observable } from "aurelia-typed-observable-plugin";
const converter = new EthweiValueConverter();
@autoinject
export class Funding {
  private refSelectToken: HTMLSelectElement;
  private dealId: string;
  private deal: DealTokenSwap;
  private isProposalLead = false;
  private daoRelatedToWallet: IDAO;
  private tokenSelectData: IPSelectItemConfig[] = [];
  @observable
  private selectedToken = 0;
  private walletBalance: BigNumber;
  private depositAmount: BigNumber;

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

  public bind() : void {
    //get the token information from the registration data for the dao this user is a representative of
    this.daoRelatedToWallet = this.getDaoRelatedToWallet();
    this.daoRelatedToWallet.tokens.forEach((x: ITokenFunding, index) => {
      //get the additional token information from the contract for this token
      x.deposited = converter.fromView(12);
      x.target = converter.fromView(100);
      x.required = converter.fromView(50);
      // calculate the percent completed
      x.percentCompleted = (Number(x.deposited) / Number(x.target)) * 100;
      this.tokenSelectData.push({
        text: x.symbol,
        innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
        value: index.toString(),
      });
    });
    //TODO get the wallet balance of the currently selected token
    this.walletBalance = converter.fromView(30.110);
  }

  /**
   * Gets the DAO of the connected wallet address
   */
  private getDaoRelatedToWallet(): IDAO{
    if (this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress)){
      return this.deal.registrationData.partnerDAO;
    }
    return this.deal.registrationData.primaryDAO;
  }

  /**
   * Navigates user to the deal page by id
   */
  private goToDealPage(): void {
    this.router.navigate("deal/" + this.dealId);
  }
  private setMax(): void{
    this.depositAmount = this.walletBalance;
  }
  private getTimeLeft(): string{
    return "5 days";
  }
  private selectedTokenChanged(){
    this.depositAmount = null;
    if (this.selectedToken === 0){
      this.walletBalance = converter.fromView(13.873);
    } else {
      this.walletBalance = converter.fromView(443.12323);
    }
  }
}
