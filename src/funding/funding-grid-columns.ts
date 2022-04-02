import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";

export const depositColumns: IGridColumn[] = [
  { field: "dao.name", width: ".5fr", sortable: true, headerText: "dao", template: "<dao-icon-name icon-size.bind='24' primary-dao.to-view='dao'></dao-icon-name>" },
  { field: "amount", width: ".5fr", headerText: "amount", sortable: true, template: "<div class='amount'><img src='${token.logoURI}' /><span><formatted-number mantissa='2' thousands-separated value.to-view='amount | ethwei:token.decimals'></formatted-number>${token.symbol}</span></div>"},
  { field: "address", width: ".5fr", sortable: true, template: `
      <address-link address.to-view="address" show-arrow-icon.bind="false" link-text.bind="address | smallHexString" >
        
        ` },
  { field: "createdAt", width: ".5fr", headerText: "age", sortable: true, template: "${getFormattedTime(createdAt)}" },
  { field: "address", width: ".2fr", headerText: "TxID", sortable: false, template: "<etherscan-button href-text='View' address.to-view=\"address\" is-transaction.bind=\"true\"></etherscan-button>" },
  { field: "address", width: ".25fr", sortable: false, headerText: "", template: `
        <div class="withdraw">
        <pbutton
        if.to-view="ethereumService.defaultAccountAddress === address && deal.isFunding && !withdrawTxId"
        type="secondary"
        click.delegate="withdraw(row)"
        >WITHDRAW</pbutton>
        <pbutton type="formfield" if.to-view="withdrawTxId" ptooltip.bind="getFormattedTime(withdrawnAt, 'en-US')" click.delegate="gotoEtherscan(withdrawTxId, true)">Withdrawn</pbutton>
        </div>  ` },
];

export const tokenGridColumns: IGridColumn[] = [
  {field: "name", sortable: true, width: ".5fr", headerText: "token", template: "<dao-icon-name primary-dao.to-view=\"row\" icon-size=\"24\" use-token-symbol.to-view=\"true\"></dao-icon-name>" },
  {field: "target", sortable: true, width: ".5fr", template: "${target | ethwei:row.decimals}" },
  {field: "deposited", sortable: true, width: ".5fr", template: "${deposited | ethwei:row.decimals}" },
  {field: "required", sortable: true, width: ".5fr", template: "<div class='required'>${required | ethwei:row.decimals}</div>" },
  {field: "percentCompleted", sortable: true, headerText: "Completed", width: "1fr", template: "<pprogress-bar  style='height: 10px; width: 100%'  max.bind='target'  current.bind='deposited'></pprogress-bar>" },
  {field: "percentCompleted", sortable: true, headerText: "%", width: ".2fr", template: "${percentCompleted}%" },
];

export const claimTokenGridColumns: IGridColumn[] = [
  {field: "token", sortable: true, width: ".5fr", template: "<dao-icon-name primary-dao.to-view=\"row.token\" icon-size=\"24\" use-token-symbol.to-view=\"true\"></dao-icon-name>" },
  {field: "claimable", sortable: true, width: ".5fr", align: "right", template: "${withCommas(claimable) | ethwei:row.decimals}" },
  {field: "locked", sortable: true, width: ".5fr", align: "right", template: "${withCommas(locked) | ethwei:row.decimals}" },
  {field: "total", sortable: true, width: ".5fr", align: "right", template: "${withCommas(claimable + locked) | ethwei:row.decimals}" },
];