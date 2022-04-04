import { TokenService } from "services/TokenService";
import { AlertService, ShowButtonsEnum } from "./../services/AlertService";
import { NumberService } from "./../services/NumberService";
import { IDaoTransaction } from "./../entities/DealTokenSwap";
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
import { IDAO, IToken } from "entities/DealRegistrationTokenSwap";
import { ITokenFunding } from "entities/TokenFunding";
import { IPSelectItemConfig } from "resources/elements/primeDesignSystem/pselect/pselect";
import { observable } from "aurelia-typed-observable-plugin";
import moment from "moment-timezone";
import { IAlertModel } from "services/AlertService";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";
import { tokenGridColumns, depositColumns, claimTokenGridColumns } from "./funding-grid-columns";
import { AureliaHelperService } from "services/AureliaHelperService";

export interface IDaoClaimToken {
  token: IToken, //only need iconURI, symbol and decimals
  claimable: number,
  locked: number
}
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
  private vestedAmount = 0;
  private secondDaoTokens: ITokenFunding[];
  private firstDaoTokens: ITokenFunding[];
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

  public async activate(_, __, navigationInstruction): Promise<void> {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    //wait until the deal data is there
    await this.deal.ensureInitialized();
    //Make sure the connected account is part of this deal. Otherwise redirect to home page.
    this.verifySecurity();
    //wait until the dao transactions from the contract are there
    await Utils.waitUntilTrue(() => this.deal.daoTokenTransactions !== undefined);
  }

  public async bind(): Promise<void> {
    //get contract token information from the other DAO
    //Clone the tokens from registration data and add props from ITokenFunding
    this.secondDaoTokens = JSON.parse(JSON.stringify(this.secondDao.tokens));
    this.secondDaoTokens.forEach(x => {this.setTokenContractInfo(x, this.secondDao);});

    //TODO figure out what the vested amount is from the deal
    //this.vestedAmount = this.deal.vestedAmount;
    this.vestedAmount = 0;

    //get contract token information from the DAO related to the account
    this.firstDaoTokens = JSON.parse(JSON.stringify(this.firstDao.tokens));
    this.firstDaoTokens.forEach(x => {this.setTokenContractInfo(x, this.firstDao);});

    if (this.firstDaoTokens.length === 1) {
      //if there is only one token, auto select it in the deposit form
      this.selectedToken = 0;
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
   * Returns a relative time with a custom replacer
   * @param dateTime
   * @returns string
   */
  public getFormattedTime = (dateTime: Date, locale = "en-custom"): string => {
    return this.dateService.formattedTime(dateTime).diff(locale, false);
  };

  /**
   * Gets the icon name for the transaction type
   * @param type
   * @returns string
   */
  public getTypeIcon = (type: string): string => {
    return type.toLowerCase() === "deposit" ? "down success" : "up danger";
  };

  /**
   * Executes the token swap. Called by the "Execute Token Swap" button on the UI
   *  - pops up a modal to verify the user wants to execute the swap
   *  - does nothing if they hit cancel
   *  - if they hit "execute" it will execute and show the congrats modal
   */
  public async executeSwap(): Promise<void> {
    const swapModal: IAlertModel = {
      header: "Execute token swap",
      message:
        `<p>You are about to execute the token swap between the following two DAOs. Do you want to execute the swap?</p>
        <div class='modal-content'>${this.getDaoHtmlForSwap(this.firstDao)}${this.getDaoHtmlForSwap(this.secondDao)}</div>`,
      buttonTextPrimary: "Execute Swap <i style='margin-left:5px;' class='fa'>&#xf021;</i>",
      buttonTextSecondary: "Cancel",
      buttons: ShowButtonsEnum.Both,
      data: {
        gotoEtherscan: this.gotoEtherscan, //have to pass the gotoEtherscan method to the modal from this class because the modal has the etherscan link in it
      },
    };
    // show a modal confirming the user wants to execute the swap
    const dialogResult = await this.alertService.showAlert(swapModal);
    if (!dialogResult.wasCancelled) {
      //the user said they wanted to execute the swap so call the swap contract
      //TODO wire up the execute swap method to the contract
      this.eventAggregator.publish("handleInfo", new EventConfig("This method is not implemented", EventMessageType.Exception));

      //if the swap succeeded, show the 'congrats' modal
      //TODO add the if statement if the token swap was successfully executed then show the congrats popup
      const congratulatePopupModel: IAlertModel = {
        header: "Congratulations!",
        message: "<p class='excitement'>You have successfully executed the token swap!</p>",
        confetti: true,
        buttonTextPrimary: "Close",
        className: "congratulatePopup",
      };
      await this.alertService.showAlert(congratulatePopupModel);
    }
  }

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
  public withdraw = async(transaction: IDaoTransaction): Promise<void> => {
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
      //TODO wire up the withdraw method
      this.eventAggregator.publish("handleInfo", new EventConfig("This method is not implemented", EventMessageType.Exception));
    }
  };

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
    const tokenSymbol = this.firstDaoTokens[this.selectedToken].symbol;
    //TODO re-check the contract to validate how many tokens are needed for the required deposit amount
    const recentRequiredTokens = BigNumber.from(10);
    await this.setAccountBalance(); // get the most up to date account balance to make sure it has enough
    //rebind token data if it's changed
    //TODO reset all the data after checking
    // const token = this.firstDaoTokens[this.selectedToken] as ITokenFunding;
    // token.required = recentRequiredTokens;
    // token.deposited = converter.fromView(120);
    // token.target = converter.fromView(120);
    // token.percentCompleted = 12;

    if (this.depositAmount.gt(this.accountBalance)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${tokenSymbol}) exceeds the current balance in your account (${BigNumber.from(this.accountBalance)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning, "Insufficient Balance"));
      this.depositAmount = this.accountBalance;
      return;
    }
    if (this.depositAmount.gt(recentRequiredTokens)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${tokenSymbol}) exceeds the required funding needed (${BigNumber.from(recentRequiredTokens)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning));
      this.depositAmount = recentRequiredTokens;
      return;
    }
    //TODO implement the deposit of tokens
    this.eventAggregator.publish("handleInfo", new EventConfig(`Depositing ${BigNumber.from(this.depositAmount)} ${tokenSymbol} on behalf of ${this.firstDao.name}`, EventMessageType.Info, "Deposit Submitted"));
    //TODO handle account provider transaction rejection
    //TODO handle the popup notification on the event of the deposit actually being completed
  }

  /**
   * Gets the HTML for the dao token swap modal popup
   * @param dao
   * @returns string
   */
  private getDaoHtmlForSwap(dao: IDAO): string {
    return `
      <div>
        <h6>${dao.name} treasury address</h6>
        <div class="dao">
          ${dao.treasury_address} 
          <div class="buttons">
            <copy-to-clipboard-button text-to-copy="${dao.treasury_address}"></copy-to-clipboard-button>
            <etherscan-button address="${dao.treasury_address}" is-transaction.bind="false"></etherscan-button>            
          </div>
        </div>
      </div>
      `;
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
        this.eventAggregator.publish("handleInfo", new EventConfig("You may not deposit more than the required amount", EventMessageType.Info));
      } else {
        //the account has a lower balance than the remaining needed tokens so set the deposit amount to the full account amount
        this.depositAmount = this.accountBalance;
        this.eventAggregator.publish("handleInfo", new EventConfig("The required funding exceeds your balance. You will be able to deposit your balance but it will not completely fund the deal for this token.", EventMessageType.Info));
      }
    } else {
      this.eventAggregator.publish("handleInfo", new EventConfig("Please select a token first", EventMessageType.Info, "No token selected"));
    }
  }

  /**
   * Sets the additional token info from the contract
   */
  private setTokenContractInfo(token: ITokenFunding, dao: IDAO): void {
    //get the additional token information from the contract for this token
    console.log("Dao token transactions", this.deal.daoTokenTransactions.get(dao));
    token.deposited = this.deal.daoTokenTransactions.get(dao).reduce((a, b) => b.type === "deposit" ? a.add(b.amount) : a.sub(b.amount), BigNumber.from(0));
    // calculate the required amount of tokens needed to complete the swap by subtracting target from deposited
    token.required = BigNumber.from(token.amount).sub(token.deposited);
    // calculate the percent completed based on deposited divided by target
    // We're using bignumberjs because BigNumber can't handle division
    //token.percentCompleted = this.numberService.fromString(fromWei(toBigNumberJs(token.deposited.toString()).div(BigNumber.from(token.amount).toString()).toString(), token.decimals)) * 100;
  }

  /**
   * Verifies the current account has access to this page and if it doesn't, redirect them
   */
  private verifySecurity(): void {
    if (!this.deal || !this.deal.registrationData) return;
    if (!this.deal.registrationData.primaryDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
      !this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
      !this.deal.isUserProposalLead
    ) {
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

  @computedFrom("deal.executedAt", "deal.fundingPeriod")
  public get fundingDaysLeft() : number {
    if (this.deal.executedAt && this.deal.fundingPeriod) {
      const executionTime = this.deal.executedAt;
      executionTime.setSeconds(executionTime.getSeconds() + this.deal.fundingPeriod);
      const finalDate = moment(executionTime);
      const now = moment();
      return finalDate.diff(now, "days");
    }
    return 0;
  }

  @computedFrom("firstDaoTokens")
  public get tokenSelectData() : IPSelectItemConfig[]{
    return this.firstDaoTokens.map((x, index) => ({
      text: x.symbol,
      innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
      value: index.toString(),
    }));
  }

  @computedFrom("firstDaoTokens")
  public get firstDaoTokensToClaim() : IDaoClaimToken[]{
    return this.firstDaoTokens.map(x => ({
      token: x,
      claimable: 1,
      locked: 2,
    }));
  }
  @computedFrom("secondDaoTokens")
  public get secondDaoTokensToClaim() : IDaoClaimToken[]{
    return this.secondDaoTokens.map(x => ({
      token: x,
      claimable: 21,
      locked: 51,
    }));
  }

  public async setAccountBalance() : Promise<void> {
    const contract = this.tokenService.getTokenContract(this.firstDaoTokens[this.selectedToken].address);
    this.accountBalance = await contract.balanceOf(this.ethereumService.defaultAccountAddress);
  }

  //moving this getter locally for the proposal lead
  public get firstDao() : IDAO{
    return this.deal.isUserProposalLead ? this.deal.primaryDao : this.deal.daoRepresentedByCurrentAccount;
  }

  //moving this getter locally for the proposal lead
  public get secondDao() : IDAO {
    return this.deal.isUserProposalLead ? this.deal.partnerDao : this.deal.daoOtherThanRepresentedByCurrentAccount;
  }
}
