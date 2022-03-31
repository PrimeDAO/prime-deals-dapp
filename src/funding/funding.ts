import { TokenService } from "services/TokenService";
import { fromWei } from "./../services/EthereumService";
import { AlertService, ShowButtonsEnum } from "./../services/AlertService";
import { NumberService } from "./../services/NumberService";
import { IDaoClaimToken, IDaoTransaction } from "./../entities/DealTokenSwap";
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
import { ITokenFunding } from "entities/TokenFunding";
import { IPSelectItemConfig } from "resources/elements/primeDesignSystem/pselect/pselect";
import { observable } from "aurelia-typed-observable-plugin";
import moment from "moment-timezone";
import { IAlertModel } from "services/AlertService";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";
import { tokenGridColumns, transactionColumns, claimTokenGridColumns } from "./funding-grid-columns";
import { toBigNumberJs } from "services/BigNumberService";
@autoinject
export class Funding {
  private transactionColumns: IGridColumn[] = transactionColumns;
  private tokenGridColumns: IGridColumn[] = tokenGridColumns;
  private claimTokenGridColumns: IGridColumn[] = claimTokenGridColumns;
  private deal: DealTokenSwap;
  private dealId: string;
  private depositAmount: BigNumber;
  private loadingDeposits = false;
  private refSelectToken: HTMLSelectElement;
  private seeingMore = false;
  private walletBalance: BigNumber;
  @observable
  private selectedToken: number | string;
  private tokenDepositContractUrl = "";
  private tokenSwapModuleContractUrl = "";
  private vestedAmount = 0;
  private otherDaoTokens: ITokenFunding[];
  private daoRelatedToWalletTokens: ITokenFunding[];
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
  ) {
    Utils.waitUntilTrue(() => !!this.ethereumService.defaultAccountAddress, 5000);
  }

  /**
   * Returns if the connected wallet address is the deal's proposal lead
   * @return boolean
   */
  @computedFrom("ethereumService.defaultAccountAddress")
  public get isProposalLead(): boolean {
    return this.ethereumService.defaultAccountAddress === this.deal.registrationData.proposalLead.address;
  }

  public async activate(_, __, navigationInstruction): Promise<void> {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
    //Make sure the connected wallet is part of this deal. Otherwise redirect to home page.
    this.verifySecurity();
  }

  public async bind(): Promise<void> {
    //get contract token information from the other DAO
    //Clone the tokens from registration data and add props from ITokenFunding
    this.otherDaoTokens = JSON.parse(JSON.stringify(this.otherDaoTokens));
    this.otherDaoTokens.forEach(x => {this.setTokenContractInfo(x);});

    //TODO figure out what the vested amount is from the deal
    //this.vestedAmount = this.deal.vestedAmount;
    this.vestedAmount = 0;

    //get contract token information from the DAO related to the wallet
    this.daoRelatedToWalletTokens = JSON.parse(JSON.stringify(this.deal.daoRelatedToWallet.tokens));
    this.daoRelatedToWalletTokens.forEach(x => {this.setTokenContractInfo(x);});

    if (this.daoRelatedToWalletTokens.length === 1) {
      //if there is only one token, auto select it in the deposit form
      this.selectedToken = 0;
      //and get the wallet balance for that token
      await this.setWalletBalance();
    }
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
    //This is for the page to redirect to the home page if the user changes their wallet address while on the funding page and their new wallet address isn't part of this deal
    this.eventAggregator.subscribe("Network.Changed.Account", (): void => {
      this.verifySecurity();
    });
  }

  /**
   * Returns a relative time with a custom replacer
   * @param dateTime
   * @returns string
   */
  public getFormattedTime = (dateTime: Date): string => {
    return this.dateService.formattedTime(dateTime).diff();
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
   * Initiates the token swap. Called by the "Initiate Token Swap" button on the UI
   *  - pops up a modal to verify the user wants to initiate the swap
   *  - does nothing if they hit cancel
   *  - if they hit "Initiate" it will execute and show the congrats modal
   */
  public async initiateSwap(): Promise<void> {
    const swapModal: IAlertModel = {
      header: "Initiate token swap",
      message:
        `<p>You are about to initiate token swapping between the following two DAOs. Do you want to initiate these swaps?</p>
        <div class='modal-content'>${this.getDaoHtmlForSwap(this.deal.daoRelatedToWallet)}${this.getDaoHtmlForSwap(this.deal.otherDao)}</div>`,
      buttonTextPrimary: "Initiate Swap <i style='margin-left:5px;' class='fa'>&#xf021;</i>",
      buttonTextSecondary: "Cancel",
      buttons: ShowButtonsEnum.Both,
      data: {
        gotoEtherscan: this.gotoEtherscan, //have to pass the gotoEtherscan method to the modal from this class because the modal has the etherscan link in it
      },
    };
    // show a modal confirming the user wants to initiate the swap
    const dialogResult = await this.alertService.showAlert(swapModal);
    if (!dialogResult.wasCancelled) {
      //the user said they wanted to initiate the swap so call the swap contract
      //TODO wire up the initiate swap method to the contract
      this.eventAggregator.publish("handleInfo", new EventConfig("This method is not implemented", EventMessageType.Exception));

      //if the swap succeeded, show the 'congrats' modal
      //TODO add the if statement if the token swap was successfully initiated then show the congrats popup
      const congratulatePopupModel: IAlertModel = {
        header: "Congratulations!",
        message: "<p class='excitement'>You have successfully initiated the token swaps!</p>",
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
   * Withdraws the deposit made from the connected wallet
   * @param transaction
   */
  public withdraw = async(transaction: IDaoTransaction): Promise<void> => {
    const withdrawModal: IAlertModel = {
      header: `You are about to withdraw ${this.withCommas(transaction.token.amount)} ${transaction.token.symbol} from the deal`,
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
   * Checks the user's input to make sure they aren't trying to deposit more than their wallet balance
   * or the remaining needed tokens for that contract
   */
  private checkMaxAmount(): void {
    if (this.deal.daoRelatedToWallet?.tokens.length > 0 && this.selectedToken) {
      const remainingNeeded = (this.daoRelatedToWalletTokens[this.selectedToken])?.required;
      if (this.walletBalance.lt(this.depositAmount)) {
        //set the deposit amount = wallet balance if the amount the user entered is higher than the wallet balance
        this.depositAmount = this.walletBalance;
      } else if (this.depositAmount.gt(remainingNeeded)) {
        //set the deposit amount = remaining needed amount if the amount the user entered is higher than the remaining amount
        this.depositAmount = remainingNeeded;
      }
    }
  }

  /**
   * Deposits the tokens from the wallet to the contract
   */
  private depositTokens(): void {
    const tokenSymbol = this.daoRelatedToWalletTokens[this.selectedToken].symbol;
    //TODO re-check the contract to validate how many tokens are needed for the required deposit amount
    const recentRequiredTokens = BigNumber.from(10);
    //TODO re-check the balance of the wallet to make sure the wallet has enough tokens
    const recentWalletBalance = BigNumber.from(120);
    //rebind token data if it's changed
    //TODO reset all the data after checking
    // const token = this.daoRelatedToWalletTokens[this.selectedToken] as ITokenFunding;
    // token.required = recentRequiredTokens;
    // token.deposited = converter.fromView(120);
    // token.target = converter.fromView(120);
    // token.percentCompleted = 12;

    if (this.depositAmount.gt(recentWalletBalance)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${tokenSymbol}) exceeds the current balance in your wallet (${BigNumber.from(recentWalletBalance)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning, "Insufficient Balance"));
      this.depositAmount = recentWalletBalance;
      return;
    }
    if (this.depositAmount.gt(recentRequiredTokens)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${BigNumber.from(this.depositAmount)} ${tokenSymbol}) exceeds the required funding needed (${BigNumber.from(recentRequiredTokens)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning));
      this.depositAmount = recentRequiredTokens;
      return;
    }
    //TODO implement the deposit of tokens
    this.eventAggregator.publish("handleInfo", new EventConfig(`Depositing ${BigNumber.from(this.depositAmount)} ${tokenSymbol} on behalf of ${this.deal.daoRelatedToWallet.name}`, EventMessageType.Info, "Deposit Submitted"));
    //TODO handle wallet provider transaction rejection
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
            <svg class="etherscan-button" ptooltip="Inspect on Etherscan" click.delegate="data.gotoEtherscan('${dao.treasury_address}')" width="17" height="17" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="#F9F6F9"/>
            </svg>
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
  private selectedTokenChanged(newVal: number | string, prevVal: number | string): void {
    this.depositAmount = null;
    if (typeof newVal === "string") newVal = Number(newVal);
    if (typeof prevVal === "string") prevVal = Number(prevVal);
    //TODO When the selected token changes, change the wallet balance for the new token
    if (newVal !== prevVal) {
      if (newVal === 0) {
        //TODO get and set the wallet balance of the currently selected token
        this.walletBalance = BigNumber.from(443.12323);
      } else if (newVal === 1) {
        //TODO get and set the wallet balance of the currently selected token
        this.walletBalance = BigNumber.from(13.873);
      }
    }
  }

  /**
   * Calculate the max amount of tokens the user is able to deposit
   */
  private async setMax(): Promise<void> {
    if (this.deal.daoRelatedToWallet?.tokens.length > 0 && this.selectedToken) {
      const remainingNeeded = (this.daoRelatedToWalletTokens[this.selectedToken]).required;
      if (Number(remainingNeeded) < Number(this.walletBalance)) {
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
   * Sets the additional token info from the contract
   */
  private setTokenContractInfo(token: ITokenFunding): void {
    //get the additional token information from the contract for this token
    token.deposited = BigNumber.from("80"); //TODO get total amount of deposited tokens from the DepositContract
    // calculate the required amount of tokens needed to complete the swap by subtracting target from deposited
    token.required = BigNumber.from(token.amount).sub(token.deposited);
    // calculate the percent completed based on deposited divided by target
    // We're using bignumberjs because BigNumber can't handle division
    token.percentCompleted = this.numberService.fromString(fromWei(toBigNumberJs(token.deposited).div(token.amount).toString(), token.decimals)) * 100;
  }

  /**
   * Verifies the current wallet has access to this page and if it doesn't, redirect them
   */
  private verifySecurity(): void {
    if (!this.deal || !this.deal.registrationData) return;
    if (!this.deal.registrationData.primaryDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
      !this.deal.registrationData.partnerDAO.representatives.some(x => x.address === this.ethereumService.defaultAccountAddress) &&
      this.ethereumService.defaultAccountAddress !== this.deal.registrationData.proposalLead.address
    ) {
      //redirect user to the home page if not the proposal lead or one of the deal's representatives
      this.router.navigate("home");
    }
  }

  @computedFrom("deal.daoTokenTransactions")
  public get deposits() : IDaoTransaction[] {
    return [...this.mapTransactionsToDeposits(this.deal.daoTokenTransactions.get(this.deal.daoRelatedToWallet)), ...this.mapTransactionsToDeposits(this.deal.daoTokenTransactions.get(this.deal.otherDao))].sort((a, b) => b.createdAt < a.createdAt ? 1 : -1);
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

  @computedFrom("daoRelatedToWalletTokens")
  public get tokenSelectData() : IPSelectItemConfig[]{
    return this.daoRelatedToWalletTokens.map((x, index) => ({
      text: x.symbol,
      innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
      value: index.toString(),
    }));
  }

  @computedFrom("daoRelatedToWalletTokens")
  public get tokensToClaim() : IDaoClaimToken[]{
    return this.daoRelatedToWalletTokens.map(x => ({
      token: x,
      claimable: 1,
      locked: 2,
    }));
  }

  public async setWalletBalance() : Promise<void> {
    const contract = this.tokenService.getTokenContract(this.daoRelatedToWalletTokens[this.selectedToken].address);
    this.walletBalance = await contract.balanceOf(this.ethereumService.defaultAccountAddress);
  }
}
