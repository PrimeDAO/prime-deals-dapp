import { IDaoTransaction } from "./../entities/DealTokenSwap";
import { DateService } from "services/DateService";
import { EventMessageType } from "./../resources/elements/primeDesignSystem/types";
import { EventConfig } from "./../services/GeneralEvents";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import { EthweiValueConverter } from "./../resources/value-converters/ethwei";
import "./funding.scss";
import { ContractsService } from "services/ContractsService";
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
import moment from "moment-timezone";
const converter = new EthweiValueConverter();
@autoinject
export class Funding {
  private refSelectToken: HTMLSelectElement;
  private dealId: string;
  private deal: DealTokenSwap;
  private isProposalLead = false;
  private daoRelatedToWallet: IDAO;
  private otherDao: IDAO;
  private tokenSelectData: IPSelectItemConfig[] = [];
  @observable
  private selectedToken: number;
  private walletBalance: BigNumber;
  private depositAmount: BigNumber;
  private fundingDaysLeft: number;
  private tokenDepositContractUrl = "";
  private tokenSwapModuleContractUrl = "";
  private transactions: IDaoTransaction[] = [];
  private loadingTransactions = false; //TODO set this to true by default and false after transactions load
  private seeingMore = false;
  private swapCompletedNoVestedAmount = false;

  constructor(
    private router: Router,
    private readonly dealService: DealService,
    private ethereumService: EthereumService,
    private contractsService: ContractsService,
    private dateService: DateService,
    private eventAggregator: EventAggregator,
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
    //TODO get the contract from the blockchain
    // const baseContract = await this.contractsService.getContractFor(ContractNames.BASECONTRACT);
    // console.log("Primary DAO Address", this.deal.registrationData.primaryDAO.treasury_address);
    // console.log("Partner DAO Address", this.deal.registrationData.partnerDAO.treasury_address);
    // const primaryDaoContractAddress = await baseContract.getDepositContract(this.deal.registrationData.primaryDAO.treasury_address);
    // const partnerDaoContractAddress = await baseContract.getDepositContract(this.deal.registrationData.partnerDAO.treasury_address);
    //const primaryDao = this.contractsService.getContractAtAddress(ContractNames.BASECONTRACT, this.deal.registrationData.primaryDAO.treasury_address);
    //const processId = this.ethereumService.hash("TOKEN_SWAP_MODULE", "deal1");
    //await baseContract.getAvailableProcessBalance(processId, this.deal.registrationData.primaryDAO.tokens[0].address);
    // console.log(baseContract);
    // console.log(primaryDaoContractAddress);
    // console.log(partnerDaoContractAddress);
    //TODO get the tokenDepositContractUrl and set it
    //TODO get the tokenSwapModuleContractUrl and set it
  }

  public async bind() : Promise<void> {
    //get the token information from the registration data for the dao this user is a representative of
    this.setDaosBasedOnWallet();

    //get contract token information from the other DAO
    this.otherDao.tokens.forEach((x: ITokenFunding) => {
      this.setTokenContractInfo(x);
    });

    //TODO figure out what the vested amount is from the deal
    //this.swapCompletedNoVestedAmount = this.deal.isCompleted && this.deal.vestedAmount <= 0
    this.swapCompletedNoVestedAmount = true;

    //TODO: Check the time left on the funding period and if there is no time left set "Target Not Reached" for each DAO status
    const d = new Date(); //TODO comment out - test data
    d.setDate(d.getDate() - 40); //TODO comment out - test data
    this.deal.executedAt = d; //TODO comment out - test data
    if (this.deal.executedAt && this.deal.executionPeriod){
      const executionTime = this.deal.executedAt;
      executionTime.setSeconds(executionTime.getSeconds() + this.deal.executionPeriod);
      const finalDate = moment(executionTime);
      const now = moment();
      this.fundingDaysLeft = finalDate.diff(now, "days");
      console.log("End date", this.fundingDaysLeft);
    }

    //get contract token information from the DAO related to the wallet
    this.daoRelatedToWallet.tokens.forEach((x: ITokenFunding, index) => {
      this.setTokenContractInfo(x);
      //push this token information into the deposit dropdown
      this.tokenSelectData.push({
        text: x.symbol,
        innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
        value: index.toString(),
      });
    });

    if (this.daoRelatedToWallet.tokens.length === 1){
      //if there is only one token, auto select it in the deposit form
      this.selectedToken = 0;
      //and get the wallet balance for that token
      this.walletBalance = converter.fromView(443.12323, 18); //TODO get wallet balance for the given token
    }

    //get the transactions for this deal
    const daoRelatedToWalletTransactions = await this.deal.getDaoTransactions(this.daoRelatedToWallet);
    const otherDaoTransactions = await this.deal.getDaoTransactions(this.otherDao);
    console.log(daoRelatedToWalletTransactions);
    console.log(otherDaoTransactions);
  }

  /**
   * Sets the additional token info from the contract
   */
  private setTokenContractInfo(token: ITokenFunding): void{
    //get the additional token information from the contract for this token
    token.deposited = converter.fromView(100, 18); //TODO get total amount of deposited tokens from the DepositContract
    token.target = converter.fromView(100, 18); //TODO get the target amount of tokens to be reached
    // calculate the required amount of tokens needed to complete the swap by subtracting target from deposited
    token.required = converter.fromView(Number(converter.toView(token.target, token.decimals)) - Number(converter.toView(token.deposited, token.decimals)), token.decimals);
    // calculate the percent completed based on deposited divided by target
    token.percentCompleted = (Number(token.deposited) / Number(token.target)) * 100;
  }

  /**
   * Sets the DAOs based on the connected wallet address
   */
  private setDaosBasedOnWallet(): void{
    if (this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress)){
      //the connected wallet is a representative of the partner DAO
      this.daoRelatedToWallet = this.deal.registrationData.partnerDAO;
      this.otherDao = this.deal.registrationData.primaryDAO;
      return;
    }
    //the connceted wallet is either a representative of the primary DAO or the proposal lead
    this.daoRelatedToWallet = this.deal.registrationData.primaryDAO;
    this.otherDao = this.deal.registrationData.partnerDAO;
  }

  /**
   * Navigates user to the deal page by id
   */
  private goToDealPage(): void {
    this.router.navigate("deal/" + this.dealId);
  }

  /**
   * Calculate the max amount of tokens the user is able to deposit
   */
  private async setMax(): Promise<void>{
    if (this.daoRelatedToWallet?.tokens.length > 0 && this.selectedToken){
      const remainingNeeded = (this.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding).required;
      if (Number(remainingNeeded) < Number(this.walletBalance)){
        //the wallet has a higher balance than the remaining needed tokens so set the deposit amount to the remaining needed
        this.depositAmount = remainingNeeded;
        this.eventAggregator.publish("handleInfo", new EventConfig("You may not deposit more than the required amount", EventMessageType.Info));
      } else {
        //the wallet has a lower balance than the remaining needed tokens so set the deposit amount to the full wallet amount
        this.depositAmount = this.walletBalance;
        this.eventAggregator.publish("handleInfo", new EventConfig("The required funding exceeds your balance. You will be able to deposit your balance but it will not completely fund the deal for this token.", EventMessageType.Info));
      }
    } else {
      this.eventAggregator.publish("handleInfo", new EventConfig("Please select a token first", EventMessageType.Info, "No token selected"));
    }
  }

  /**
   * Checks the user's input to make sure they aren't trying to deposit more than their wallet balance
   * or the remaining needed tokens for that contract
   */
  private checkMaxAmount(): void {
    if (this.daoRelatedToWallet?.tokens.length > 0 && this.selectedToken){
      const remainingNeeded = (this.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding)?.required;
      if (Number(this.walletBalance) < Number(this.depositAmount)) {
        //set the deposit amount = wallet balance if the amount the user entered is higher than the wallet balance
        this.depositAmount = this.walletBalance;
      } else if (Number(this.depositAmount) > Number(remainingNeeded)){
        //set the deposit amount = remaining needed amount if the amount the user entered is higher than the remaining amount
        this.depositAmount = remainingNeeded;
      }
    }
  }

  /**
   * Deposits the tokens from the wallet to the contract
   */
  private depositTokens(): void {
    const tokenSymbol = this.daoRelatedToWallet.tokens[this.selectedToken].symbol;
    //TODO re-check the contract to validate how many tokens are needed for the required deposit amount
    const recentRequiredTokens = converter.fromView(10, 18);
    //TODO re-check the balance of the wallet to make sure the wallet has enough tokens
    const recentWalletBalance = converter.fromView(120, 18);
    //rebind token data if it's changed
    //TODO reset all the data after checking
    // const token = this.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding;
    // token.required = recentRequiredTokens;
    // token.deposited = converter.fromView(120);
    // token.target = converter.fromView(120);
    // token.percentCompleted = 12;

    if (Number(this.depositAmount) > Number(recentWalletBalance)){
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${converter.toView(this.depositAmount, 18)} ${tokenSymbol}) exceeds the current balance in your wallet (${converter.toView(recentWalletBalance, 18)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning, "Insufficient Balance"));
      this.depositAmount = recentWalletBalance;
      return;
    }
    if (Number(this.depositAmount)> Number(recentRequiredTokens)){
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${converter.toView(this.depositAmount, 18)} ${tokenSymbol}) exceeds the required funding needed (${converter.toView(recentRequiredTokens, 18)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning));
      this.depositAmount = recentRequiredTokens;
      return;
    }
    //TODO implement the deposit of tokens
    this.eventAggregator.publish("handleInfo", new EventConfig(`Depositing ${converter.toView(this.depositAmount, 18)} ${tokenSymbol} on behalf of ${this.daoRelatedToWallet.name}`, EventMessageType.Info, "Deposit Submitted"));
    //TODO handle wallet provider transaction rejection
  }

  /**
   * Handles the change event of the select token dropdown
   */
  private selectedTokenChanged(newVal: number | string, prevVal: number | string): void{
    this.depositAmount = null;
    if (typeof newVal === "string") newVal = Number(newVal);
    if (typeof prevVal === "string") prevVal = Number(prevVal);
    //TODO When the selected token changes, change the wallet balance for the new token
    if (newVal !== prevVal){
      if (newVal === 0){
        //TODO get and set the wallet balance of the currently selected token
        this.walletBalance = converter.fromView(443.12323, 18);
      } else if (newVal === 1){
        //TODO get and set the wallet balance of the currently selected token
        this.walletBalance = converter.fromView(13.873, 18);
      }
    }
  }

  /**
   * Returns a relative time with a custom replacer
   * @param dateTime
   * @returns string
   */
  public getFormattedTime(dateTime: Date): string {
    return this.dateService.formattedTime(dateTime).diff("en-US").replace("a ", "1 ");
  }

  /**
   * This allows for more transactions to be displayed on the funding page transactions grid
   * @param yesNo
   */
  public seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
  }

  /**
   * Gets the icon name for the transaction type
   * @param type
   * @returns string
   */
  public getTypeIcon(type: string): string {
    return type.toLowerCase() === "deposit" ? "down success" : "up danger";
  }

  /**
   * Withdraws the deposit made from the connected wallet
   * @param transaction
   */
  public withdraw(transaction: IDaoTransaction) : void {
    //TODO wire up the withdraw method
    this.eventAggregator.publish("handleInfo", new EventConfig("This method is not implemented", EventMessageType.Exception));
  }

  /**
   * Opens a new window to the transaction id on the blockchain
   * @param txid
   */
  public viewTransaction(txid: string): void{
    //TODO wire up the view transaction method
    this.eventAggregator.publish("handleInfo", new EventConfig("This method is not implemented", EventMessageType.Exception));
  }
}
