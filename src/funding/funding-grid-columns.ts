import { SortOrder } from "./../services/SortService";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";
import { IDaoTransaction } from "entities/DealTokenSwap";

export const depositColumns: IGridColumn[] = [
  { field: "dao.name", width: ".5fr", sortable: true, headerText: "dao", template: "<dao-icon-name icon-size.bind='24' primary-dao.to-view='dao'></dao-icon-name>" },
  {
    field: "amount", sortFunc: (a: IDaoTransaction, b: IDaoTransaction, sortDirection: SortOrder = 1) => {
      if (a.token.name < b.token.name) return 1 * sortDirection;
      if (a.token.name > b.token.name) return -1 * sortDirection;
      if (a.amount < b.amount) return 1;
      if (a.amount > b.amount) return -1;
      return 0;
    }, width: ".5fr", headerText: "amount", sortable: true, template: "<div class='amount'><img src='${token.logoURI}' /><span><formatted-number mantissa='2' thousands-separated value.to-view='amount | ethwei:token.decimals'></formatted-number>${token.symbol}</span></div>" },
  {
    field: "address", width: ".5fr", sortable: true, template: `
      <address-link address.to-view="address" show-arrow-icon.bind="false" link-text.bind="address | smallHexString" >
        
        ` },
  { field: "createdAt", width: ".5fr", headerText: "age", sortable: true, template: "${dateService.formattedTime(createdAt).diff('en-US', false)}" },
  { field: "txid", width: ".2fr", headerText: "TxID", sortable: false, template: "<etherscan-button href-text='View' address.to-view=\"txid\" is-transaction.bind=\"true\"></etherscan-button>" },
  {
    field: "address", width: ".25fr", sortable: false, headerText: "", template: `
        <div class="withdraw">
        <pbutton
        if.to-view="ethereumService.defaultAccountAddress === address && deal.isFunding && !withdrawTxId"
        type="secondary"
        click.delegate="withdraw(row)"
        >WITHDRAW</pbutton>
        <pbutton type="formfield" if.to-view="withdrawTxId" ptooltip.bind="dateService.formattedTime(withdrawnAt).diff('en-US', false)" click.delegate="gotoEtherscan(withdrawTxId, true)">Withdrawn</pbutton>
        </div>  ` },
];

export const tokenGridColumns: IGridColumn[] = [
  { field: "name", sortable: true, width: ".5fr", headerText: "token", template: "<dao-icon-name primary-dao.to-view=\"row\" icon-size=\"24\" use-token-symbol.to-view=\"true\"></dao-icon-name>" },
  { field: "target", sortable: true, width: ".5fr", template: "<formatted-number thousands-separated value.to-view='amount | ethwei:decimals'></formatted-number>" },
  { field: "deposited", sortable: true, width: ".5fr", template: "<formatted-number thousands-separated value.to-view='deposited | ethwei:decimals'></formatted-number>" },
  { field: "required", sortable: true, width: ".5fr", template: "<div class='required'><formatted-number thousands-separated value.to-view='required | ethwei:decimals'></formatted-number></div>" },
  { field: "percentCompleted", sortable: true, headerText: "Completed", width: "1fr", template: "<pprogress-bar  style='height: 10px; width: 100%'  max.bind='amount'  current.bind='deposited'></pprogress-bar>" },
  { field: "percentCompleted", sortable: true, align: "right", headerText: "%", width: ".2fr", template: "<formatted-number thousands-separated value.to-view='percentCompleted'></formatted-number>%" },
];

export const claimTokenGridColumns: IGridColumn[] = [
  { field: "token", headerText: "Token", sortable: true, width: ".5fr", template: "<dao-icon-name primary-dao.to-view='row' icon-size='24' use-token-symbol.to-view='true'></dao-icon-name>" },
  { field: "claimable", headerText: "Claimable", sortable: true, width: ".5fr", align: "right", template: "<formatted-number mantissa='2' thousands-separated value.to-view='claimable | ethwei:decimals'></formatted-number>" },
  { field: "locked", headerText: "Locked", sortable: true, width: ".5fr", align: "right", template: "<formatted-number mantissa='2' thousands-separated value.to-view='locked | ethwei:decimals'></formatted-number>" },
  { field: "amount", headerText: "Total", sortable: true, width: ".5fr", align: "right", template: "<formatted-number mantissa='2' thousands-separated value.to-view='amount | ethwei:decimals'></formatted-number>" },
];
