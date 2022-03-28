import { AlertService, ShowButtonsEnum } from "./../services/AlertService";
import { NumberService } from "./../services/NumberService";
import { IDaoClaimToken, IDaoTransaction } from "./../entities/DealTokenSwap";
import { DateService } from "services/DateService";
import { EventMessageType } from "./../resources/elements/primeDesignSystem/types";
import { EventConfig } from "./../services/GeneralEvents";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import { EthweiValueConverter } from "./../resources/value-converters/ethwei";
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
const converter = new EthweiValueConverter();

const transactionColumns:
{ field: string, headerText?: string, sortable?: boolean, width: string, headerClass?: string, template?: string }[] = [
  { field: "dao.name", width: ".5fr", sortable: true, headerText: "dao", template: "<dao-icon-name icon-size.bind='24' primary-dao.to-view='dao'></dao-icon-name>" },
  { field: "type", width: ".5fr", sortable: true, template: "<div class='type'><i class='fas fa-arrow-${getTypeIcon(type)}'></i> ${type}</div>" },
  { field: "token.amount", width: ".5fr", headerText: "amount", sortable: true, template: "<div class='amount' ptooltip.to-view='token.amount'><img src='${token.logoURI}' /><span>${withCommas(token.amount)} ${token.symbol}</span></div>"},
  { field: "address", width: ".5fr", sortable: true, template: `
<address-link address.to-view="address" >
  
  ` },
  { field: "createdAt", width: ".5fr", headerText: "age", sortable: true, template: "${getFormattedTime(createdAt)}" },
  { field: "address", width: ".2fr", headerText: "TxID", sortable: false, template: "<etherscan-button href-text='View' address.to-view=\"address\"></etherscan-button>" },
  { field: "address", width: ".25fr", sortable: false, headerText: "", template: `
  <div class="withdraw">
  <pbutton
  if.to-view="ethereumService.defaultAccountAddress === address && type === 'deposit'"
  type="secondary"
  click.delegate="withdraw(row)"
  >WITHDRAW</pbutton></div>  ` },
];

const tokenGridColumns:{ field: string, headerText?: string, sortable?: boolean, width: string, headerClass?: string, template?: string }[] = [
  {field: "name", sortable: true, width: ".5fr", headerText: "token", template: "<dao-icon-name primary-dao.to-view=\"row\" icon-size=\"24\" use-token-symbol.to-view=\"true\"></dao-icon-name>" },
  {field: "target", sortable: true, width: ".5fr", template: "${target | ethwei:row.decimals}" },
  {field: "deposited", sortable: true, width: ".5fr", template: "${deposited | ethwei:row.decimals}" },
  {field: "required", sortable: true, width: ".5fr", template: "<div class='required'>${target | ethwei:row.decimals}</div>" },
  {field: "percentCompleted", sortable: true, headerText: "Completed", width: "1fr", template: "<pprogress-bar  style='height: 10px; width: 100%'  max.bind='target'  current.bind='deposited'></pprogress-bar>" },
  {field: "percentCompleted", sortable: true, headerText: "%", width: ".2fr", template: "${percentCompleted}%" },
];

@autoinject
export class Funding {
  private transactionColumns = transactionColumns;
  private tokenGridColumns = tokenGridColumns;
  private deal: DealTokenSwap;
  private dealId: string;
  private dealTargetReached = false;
  private depositAmount: BigNumber;
  private fundingDaysLeft: number;
  private loadingTransactions = false;
  private refSelectToken: HTMLSelectElement;
  private seeingMore = false;
  @observable
  private selectedToken: number;
  private swapCompleted = false;
  private tokenDepositContractUrl = "";
  private tokenSelectData: IPSelectItemConfig[] = [];
  private tokenSwapModuleContractUrl = "";
  private tokensToClaim: IDaoClaimToken[] = [];
  private transactions: IDaoTransaction[] = [];
  private vestedAmount = 0;
  private walletBalance: BigNumber;

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
  ) {

  }

  /**
   * Returns if the connected wallet address is the deal's proposal lead
   * @return boolean
   */
  @computedFrom("ethereumService.defaultAccountAddress")
  public get isProposalLead(): boolean {
    return this.ethereumService.defaultAccountAddress === this.deal.registrationData.proposalLead.address;
  }

  public async activate(_, __, navigationInstruction) {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
    //Make sure the connected wallet is part of this deal. Otherwise redirect to home page.
    this.verifySecurity();
    //TODO get the tokenDepositContractUrl and set it
    //TODO get the tokenSwapModuleContractUrl and set it
  }
  public async bind(): Promise<void> {
    //get contract token information from the other DAO
    this.deal.otherDao.tokens.forEach((x: ITokenFunding) => {
      this.setTokenContractInfo(x);
    });

    //TODO wire up the isTargetReached() method from DealTokenSwap.ts
    this.dealTargetReached = false;

    //TODO figure out what the vested amount is from the deal
    //this.swapCompleted = this.deal.isCompleted;
    //this.vestedAmount = this.deal.vestedAmount;
    this.swapCompleted = false;
    this.vestedAmount = 0;

    //TODO: Check the time left on the funding period and if there is no time left set "Target Not Reached" for each DAO status
    const d = new Date(); //TODO comment out - test data
    d.setDate(d.getDate() - 46); //TODO comment out - test data
    this.deal.executedAt = d; //TODO comment out - test data
    if (this.deal.executedAt && this.deal.executionPeriod) {
      const executionTime = this.deal.executedAt;
      executionTime.setSeconds(executionTime.getSeconds() + this.deal.executionPeriod);
      const finalDate = moment(executionTime);
      const now = moment();
      this.fundingDaysLeft = finalDate.diff(now, "days");
      console.log("End date", this.fundingDaysLeft);
    }

    //get contract token information from the DAO related to the wallet
    this.deal.daoRelatedToWallet.tokens.forEach((x: ITokenFunding, index) => {
      this.setTokenContractInfo(x);
      //push this token information into the deposit dropdown
      this.tokenSelectData.push({
        text: x.symbol,
        innerHTML: `<span><img src="${x.logoURI}" style="width: 24px;height: 24px;margin-right: 10px;" /> ${x.symbol}</span>`,
        value: index.toString(),
      });
    });

    if (this.deal.daoRelatedToWallet.tokens.length === 1) {
      //if there is only one token, auto select it in the deposit form
      this.selectedToken = 0;
      //and get the wallet balance for that token
      this.walletBalance = converter.fromView(443.12323, 18); //TODO get wallet balance for the given token
    }

    //get the transactions for this deal
    this.deal.daoRelatedToWallet.tokens[0].amount = "12304.23423524343122343232243";
    this.transactions.push({
      address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA",
      createdAt: new Date(),
      dao: this.deal.daoRelatedToWallet,
      depositId: 1234,
      token: this.deal.daoRelatedToWallet.tokens[0],
      type: "deposit",
      txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    });
    this.transactions.push({
      address: "0xdb6A67C15a0f10E1656517c463152c22468B78b8",
      createdAt: new Date(),
      dao: this.deal.daoRelatedToWallet,
      depositId: 1234,
      token: this.deal.daoRelatedToWallet.tokens[1],
      type: "deposit",
      txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
    });

    //TODO combine these two arrays to one and order by deposit date descending
    const daoRelatedToWalletTransactions = await this.deal.getDaoTransactions(this.deal.daoRelatedToWallet);
    const otherDaoTransactions = await this.deal.getDaoTransactions(this.deal.otherDao);
    console.log(daoRelatedToWalletTransactions);
    console.log(otherDaoTransactions);

    //TODO subscribe to an event when a transaction happens on the blockchain and update the grid's transaction data

    //TODO wire up to get the claim tokens data
    this.tokensToClaim.push({
      token: this.deal.daoRelatedToWallet.tokens[0],
      claimable: 123,
      locked: 432,
    });
    this.tokensToClaim.push({
      token: this.deal.daoRelatedToWallet.tokens[1],
      claimable: 5234,
      locked: 8976,
    });
    console.log(this.tokensToClaim);
  }

  public async canActivate() {
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
   * This allows for more transactions to be displayed on the funding page transactions grid
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
      const remainingNeeded = (this.deal.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding)?.required;
      if (Number(this.walletBalance) < Number(this.depositAmount)) {
        //set the deposit amount = wallet balance if the amount the user entered is higher than the wallet balance
        this.depositAmount = this.walletBalance;
      } else if (Number(this.depositAmount) > Number(remainingNeeded)) {
        //set the deposit amount = remaining needed amount if the amount the user entered is higher than the remaining amount
        this.depositAmount = remainingNeeded;
      }
    }
  }

  /**
   * Deposits the tokens from the wallet to the contract
   */
  private depositTokens(): void {
    const tokenSymbol = this.deal.daoRelatedToWallet.tokens[this.selectedToken].symbol;
    //TODO re-check the contract to validate how many tokens are needed for the required deposit amount
    const recentRequiredTokens = converter.fromView(10, 18);
    //TODO re-check the balance of the wallet to make sure the wallet has enough tokens
    const recentWalletBalance = converter.fromView(120, 18);
    //rebind token data if it's changed
    //TODO reset all the data after checking
    // const token = this.deal.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding;
    // token.required = recentRequiredTokens;
    // token.deposited = converter.fromView(120);
    // token.target = converter.fromView(120);
    // token.percentCompleted = 12;

    if (Number(this.depositAmount) > Number(recentWalletBalance)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${converter.toView(this.depositAmount, 18)} ${tokenSymbol}) exceeds the current balance in your wallet (${converter.toView(recentWalletBalance, 18)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning, "Insufficient Balance"));
      this.depositAmount = recentWalletBalance;
      return;
    }
    if (Number(this.depositAmount) > Number(recentRequiredTokens)) {
      this.eventAggregator.publish("handleInfo", new EventConfig(`The amount you wish to deposit (${converter.toView(this.depositAmount, 18)} ${tokenSymbol}) exceeds the required funding needed (${converter.toView(recentRequiredTokens, 18)} ${tokenSymbol}). Please submit again.`, EventMessageType.Warning));
      this.depositAmount = recentRequiredTokens;
      return;
    }
    //TODO implement the deposit of tokens
    this.eventAggregator.publish("handleInfo", new EventConfig(`Depositing ${converter.toView(this.depositAmount, 18)} ${tokenSymbol} on behalf of ${this.deal.daoRelatedToWallet.name}`, EventMessageType.Info, "Deposit Submitted"));
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
        this.walletBalance = converter.fromView(443.12323, 18);
      } else if (newVal === 1) {
        //TODO get and set the wallet balance of the currently selected token
        this.walletBalance = converter.fromView(13.873, 18);
      }
    }
  }

  /**
   * Calculate the max amount of tokens the user is able to deposit
   */
  private async setMax(): Promise<void> {
    if (this.deal.daoRelatedToWallet?.tokens.length > 0 && this.selectedToken) {
      const remainingNeeded = (this.deal.daoRelatedToWallet.tokens[this.selectedToken] as ITokenFunding).required;
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
    token.deposited = converter.fromView(80, 18); //TODO get total amount of deposited tokens from the DepositContract
    token.target = converter.fromView(100, 18); //TODO get the target amount of tokens to be reached
    // calculate the required amount of tokens needed to complete the swap by subtracting target from deposited
    token.required = converter.fromView(Number(converter.toView(token.target, token.decimals)) - Number(converter.toView(token.deposited, token.decimals)), token.decimals);
    // calculate the percent completed based on deposited divided by target
    token.percentCompleted = (Number(token.deposited) / Number(token.target)) * 100;
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
}
