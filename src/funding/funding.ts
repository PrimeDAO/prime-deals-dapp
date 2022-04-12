import { TokenService } from "services/TokenService";
import { AlertService, ShowButtonsEnum } from "./../services/AlertService";
import { NumberService } from "./../services/NumberService";
import { IDaoTransaction, ITokenCalculated } from "./../entities/DealTokenSwap";
import { DateService } from "services/DateService";
import { EventMessageType } from "./../resources/elements/primeDesignSystem/types";
import { EventConfig } from "./../services/GeneralEvents";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import "./funding.scss";
import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EthereumService } from "services/EthereumService";
import { Router } from "aurelia-router";
import { Utils } from "services/utils";
import { autoinject, computedFrom } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { IPSelectItemConfig } from "resources/elements/primeDesignSystem/pselect/pselect";
import { observable } from "aurelia-typed-observable-plugin";
import { IAlertModel } from "services/AlertService";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";
import { depositColumns, claimTokenGridColumns } from "./funding-grid-columns";
import { AureliaHelperService } from "services/AureliaHelperService";

@autoinject
export class Funding {
  private depositColumns: IGridColumn[] = depositColumns;
  private claimTokenGridColumns: IGridColumn[] = claimTokenGridColumns;
  private deal: DealTokenSwap;
  private dealId: string;
  private depositAmount: BigNumber;
  private loadingDeposits = false;
  private refSelectToken: HTMLSelectElement;
  private seeingMore = false;
  private accountBalance: BigNumber;
  @observable
  private selectedToken: number | string;
  private tokenDepositContractUrl = "";
  private tokenSwapModuleContractUrl = "";
  private secondDaoTokens: ITokenCalculated[];
  private firstDaoTokens: ITokenCalculated[];
  private deposits: IDaoTransaction[] = [];
  /**
   * Opens a new window to the transaction id or address on the blockchain
   * @param address
   * @param tx
   */
  public gotoEtherscan = (address: string, tx = false): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(address, tx));
  };

  constructor(
    private router: Router,
    private readonly dealService: DealService,
    private ethereumService: EthereumService,
    private dateService: DateService,
    private eventAggregator: EventAggregator,
    private numberService: NumberService,
    private alertService: AlertService,
    private tokenService: TokenService,
    private aureliaHelperService: AureliaHelperService,
  ) {
    //This is for the page to redirect to the home page if the user changes their account address while on the funding page and their new account address isn't part of this deal
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.verifySecurity();
    });
  }

  public async activate(params: { id: string }): Promise<void> {
    this.dealId = params.id;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    //wait until the deal data is there
    await this.deal.ensureInitialized();
    //Make sure the connected account is part of this deal. Otherwise redirect to home page.
    this.verifySecurity();
    //wait until the dao transactions from the contract are there
    await Utils.waitUntilTrue(() => this.deal.daoTokenTransactions !== undefined);
    //wait until the dao token claims from the contract are there
    await Utils.waitUntilTrue(() => this.deal.daoTokenClaims !== undefined);
  }

  public async bind(): Promise<void> {
    //get contract token information from the other DAO
    //Clone the tokens from registration data and add props from ITokenCalculated
    this.secondDaoTokens = Utils.cloneDeep(this.secondDao.tokens as ITokenCalculated[]);
    //get contract token information from the DAO related to the account
    this.firstDaoTokens = Utils.cloneDeep(this.firstDao.tokens as ITokenCalculated[]);
    this.setTokenContractData();

    if (this.firstDaoTokens.length === 1) {
      //if there is only one token, auto select it in the deposit form
      this.selectedToken = "0";
      //and get the account balance for that token
      await this.setAccountBalance();
    }

    //get deposits from deal token swap entity
    this.setDeposits();
    //subscribe a watcher to look for changes on the daoTokenTransactions
    this.aureliaHelperService.createCollectionWatch(this.deal.daoTokenTransactions, this.setDeposits);
  }

  private mapTransactionsToDeposits(transactions: IDaoTransaction[]): IDaoTransaction[]{
    return transactions.filter(x => x.type==="deposit").map(x => {
      const withdrawForDeposit = transactions.find(z => z.type==="withdraw" && z.depositId === x.depositId);
      if (withdrawForDeposit){
        x.withdrawTxId = withdrawForDeposit.txid;
        x.withdrawnAt = withdrawForDeposit.createdAt;
      }
      return x;
    });
  }

  public async canActivate() : Promise<void> {
    await Utils.waitUntilTrue(() => !!this.ethereumService.defaultAccountAddress, 5000);
  }

  /**
   * Gets the icon name for the transaction type
   * @param type
   * @returns string
   */
  public getTypeIcon = (type: string): string => {
    return type.toLowerCase() === "deposit" ? "down success" : "up danger";
  };

  /**
   * This allows for more deposits to be displayed on the funding page deposits grid
   * @param yesNo
   */
  public seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
  }

  /**
   * Formats a number with commas and two decimals
   * @param number
   * @returns string
   */
  public withCommas = (number: string | number): string => {
    return this.numberService.toString(Number(number), { thousandSeparated: true, mantissa: 2 });
  };

  /**
   * Withdraws the deposit made from the connected account
   * @param transaction
   */
  public async withdraw(transaction: IDaoTransaction): Promise<void> {
    //Check if the connected wallet is the same as the deposit to make sure they can initiate the withdraw
    //the UI already checks this but wanted to validate again to make sure
    if (this.ethereumService.defaultAccountAddress !== transaction.address){
      this.eventAggregator.publish("handleFailure", "An error has occurred");
      return;
    }
    const withdrawModal: IAlertModel = {
      header: `You are about to withdraw ${this.withCommas(transaction.amount.toString())} ${transaction.token.symbol} from the deal`,
      message:
        "<p>Are you sure you want to withdraw your funds?</p>",
      buttonTextPrimary: "Withdraw",
      buttonTextSecondary: "Cancel",
      buttons: ShowButtonsEnum.Both,
    };
    // show a modal confirming the user wants to withdraw their funds
    const dialogResult = await this.alertService.showAlert(withdrawModal);
    if (!dialogResult.wasCancelled) {
      //withdraw the tokens
      const withdrawTransaction = await this.deal.withdrawTokens(transaction.dao, transaction.depositId);
      if (withdrawTransaction){
        //tokens were withdrawn successfully
        this.eventAggregator.publish("handleInfo", new EventConfig("Your deposit has been withdrawn", EventMessageType.Info, "Withdrawn"));
      } else {
        //an error occurred while trying to withdraw tokens
        this.eventAggregator.publish("handleFailure", "An error occurred while trying to withdraw. Please try again.");
      }
    }
    //refresh token contract data for the grid
    this.setTokenContractData();
  }

  /**
   * Checks the user's input to make sure they aren't trying to deposit more than their account balance
   * or the remaining needed tokens for that contract
   */
  private checkMaxAmount(): void {
    if (this.firstDaoTokens.length > 0 && this.selectedToken) {
      const remainingNeeded = (this.firstDaoTokens[this.selectedToken])?.required;
      if (this.accountBalance.lt(this.depositAmount)) {
        //set the deposit amount = account balance if the amount the user entered is higher than the account balance
        this.depositAmount = this.accountBalance;
      } else if (this.depositAmount.gt(remainingNeeded)) {
        //set the deposit amount = remaining needed amount if the amount the user entered is higher than the remaining amount
        this.depositAmount = remainingNeeded;
      }
    }
  }

  /**
   * Deposits the tokens from the account to the contract
   */
  private async depositTokens(): Promise<void> {
    //hydrate the latest contract transaction data
    await this.deal.hydrateDaoTransactions();
    //now that the daoTransactions are hydrated, update the tokens with the contract data
    this.setTokenContractData();
    //set the token that the user is depositing
    const depositToken: ITokenCalculated = this.firstDaoTokens[this.selectedToken];
    // get the most up to date account balance to make sure it has enough
    await this.setAccountBalance();
    //validate the deposit amount is not more than the account balance
    if (this.depositAmount.gt(this.accountBalance)) {
      this.eventAggregator.publish("handleValidationError", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${depositToken.symbol}) exceeds the current balance in your account (${BigNumber.from(this.accountBalance)} ${depositToken.symbol}). Please submit again.`, EventMessageType.Warning, "Insufficient Balance"));
      this.depositAmount = this.accountBalance;
      return;
    }
    //validate the deposit amount is not more than the required tokens to fund the deal
    if (this.depositAmount.gt(depositToken.required)) {
      this.eventAggregator.publish("handleValidationError", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${depositToken.symbol}) exceeds the required funding needed (${BigNumber.from(depositToken.required)} ${depositToken.symbol}). Please submit again.`, EventMessageType.Warning));
      this.depositAmount = depositToken.required;
      return;
    }
    //all validation passed so submit the deposit
    const depositTransaction = await this.deal.depositTokens(this.firstDao, depositToken.address, this.depositAmount);
    if (depositTransaction){
      //deposit was successful
      this.eventAggregator.publish("handleInfo", new EventConfig(`${BigNumber.from(this.depositAmount)} ${depositToken.symbol} has been deposited`, EventMessageType.Info, "Deposit completed"));
    } else {
      //something happened to make the deposit not happen
      this.eventAggregator.publish("handleFailure", "An error occurred while trying to deposit tokens. Please try again.");
    }
    //refresh the token contract data
    this.setTokenContractData();
  }

  /**
   * Navigates user to the deal page by id
   */
  private goToDealPage(): void {
    this.router.navigate("deal/" + this.dealId);
  }

  /**
   * Handles the change event of the select token dropdown
   * @param newVal
   * @param prevVal
   */
  private async selectedTokenChanged(newVal: number | string, prevVal: number | string): Promise<void> {
    this.depositAmount = null;
    if (typeof newVal === "string") newVal = Number(newVal);
    if (typeof prevVal === "string") prevVal = Number(prevVal);
    if (newVal !== prevVal) {
      await this.setAccountBalance(); //selected token has changed, so set the account balance of the newly selected token
    }
  }

  /**
   * Calculate the max amount of tokens the user is able to deposit
   */
  private async setMax(): Promise<void> {
    if (this.firstDaoTokens.length > 0 && this.selectedToken) {
      const remainingNeeded = (this.firstDaoTokens[this.selectedToken]).required;
      if (Number(remainingNeeded) < Number(this.accountBalance)) {
        //the account has a higher balance than the remaining needed tokens so set the deposit amount to the remaining needed
        this.depositAmount = remainingNeeded;
        this.eventAggregator.publish("handleValidationError", new EventConfig("You may not deposit more than the required amount", EventMessageType.Info));
      } else {
        //the account has a lower balance than the remaining needed tokens so set the deposit amount to the full account amount
        this.depositAmount = this.accountBalance;
        this.eventAggregator.publish("handleValidationError", new EventConfig("The required funding exceeds your balance. You will be able to deposit your balance but it will not completely fund the deal for this token.", EventMessageType.Info));
      }
    } else {
      this.eventAggregator.publish("handleValidationError", new EventConfig("Please select a token first", EventMessageType.Info, "No token selected"));
    }
  }

  /**
   * Verifies the current account has access to this page and if it doesn't, redirect them
   */
  private verifySecurity(): void {
    if (!this.deal || !this.deal.registrationData) return;
    if (!this.deal.isUserRepresentativeOrLead){
      //redirect user to the home page if not the proposal lead or one of the deal's representatives
      this.router.navigate("home");
    }
  }

  public setDeposits() : void {
    // const deposits: IDaoTransaction[] = [];
    // deposits.push({
    //   address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA",
    //   createdAt: new Date(),
    //   dao: this.firstDao,
    //   depositId: 1234,
    //   token: this.firstDaoTokens[0],
    //   type: "deposit",
    //   txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    //   amount: BigNumber.from(1),

    // });
    // deposits.push({
    //   address: "0xdb6A67C15a0f10E1656517c463152c22468B78b8",
    //   createdAt: new Date(),
    //   dao: this.firstDao,
    //   depositId: 1234,
    //   token: this.firstDaoTokens[0],
    //   type: "deposit",
    //   txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    //   amount: BigNumber.from(14432423),
    // });
    // deposits.push({
    //   address: "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498",
    //   createdAt: new Date(),
    //   dao: this.firstDao,
    //   depositId: 1234,
    //   token: this.secondDaoTokens[0],
    //   type: "deposit",
    //   txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    //   amount: BigNumber.from("12234324234324324234312421412321"),
    //   withdrawTxId: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    //   withdrawnAt: new Date("3/13/2022")
    // });
    // this.deposits = deposits;
    // return;
    this.deposits = [...this.mapTransactionsToDeposits(this.deal.daoTokenTransactions.get(this.firstDao)), ...this.mapTransactionsToDeposits(this.deal.daoTokenTransactions.get(this.secondDao))].sort((a, b) => b.createdAt < a.createdAt ? 1 : -1);
  }

  @computedFrom("firstDaoTokens")
  public get tokenSelectData() : IPSelectItemConfig[]{
    return this.firstDaoTokens.map((x, index) => ({
      text: x.symbol,
      innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
      value: index.toString(),
    }));
  }

  public async setAccountBalance() : Promise<void> {
    const contract = this.tokenService.getTokenContract(this.firstDaoTokens[this.selectedToken].address);
    this.accountBalance = await contract.balanceOf(this.ethereumService.defaultAccountAddress);
  }

  //moving this getter locally for the proposal lead
  public get firstDao() : IDAO{
    return this.deal.isRepresentativeUser ? this.deal.daoRepresentedByCurrentAccount : this.deal.primaryDao;
  }

  //moving this getter locally for the proposal lead
  public get secondDao() : IDAO {
    return this.deal.isRepresentativeUser ? this.deal.daoOtherThanRepresentedByCurrentAccount : this.deal.partnerDao;
  }

  private setTokenContractData(){
    this.firstDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.firstDao);});
    this.secondDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.secondDao);});
  }
}
