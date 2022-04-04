import "./pgridDemo.scss";

export class PGridDemo {
  condensedColumns= [
    {field: "name", sortable: true, width: ".5fr", headerText: "token", template: "<dao-icon-name primary-dao.to-view=\"row\" icon-size=\"24\" use-token-symbol.to-view=\"true\"></dao-icon-name>" },
    {field: "target", sortable: true, width: ".5fr", template: "${target}" },
    {field: "deposited", sortable: true, width: ".5fr", template: "${deposited}" },
    {field: "required", sortable: true, width: ".5fr", template: "<div class='required'>${target - deposited}</div>" },
    {field: "percentCompleted", sortable: true, headerText: "Completed", width: "1fr", template: "<pprogress-bar  style='height: 10px; width: 100%'  max.bind='target'  current.bind='deposited'></pprogress-bar>" },
    {field: "percentCompleted", sortable: true, headerText: "%", width: ".2fr", template: "${(deposited/target)* 100}%" },
  ];
  condensedData = [
    {
      name: "Prime",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
      target: 100,
      deposited: 80,
    },
    {
      name: "Prime",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
      target: 200,
      deposited: 50,
    },
  ];

  columns =
    [
      { field: "dao.name", width: ".5fr", sortable: true, headerText: "dao", template: "<dao-icon-name icon-size.bind='24' primary-dao.to-view='dao'></dao-icon-name>" },
      { field: "type", width: ".5fr", sortable: true, template: "<div class='type'><i class='fas fa-arrow-${type.toLowerCase() === \"deposit\" ? \"down success\" : \"up danger\"}'></i> ${type}</div>" },
      { field: "token.amount", width: ".5fr", headerText: "amount", sortable: true, template: "<div class='amount' ptooltip.to-view='token.amount'><img src='${token.logoURI}' /><span>${token.amount} ${token.symbol}</span></div>"},
      { field: "address", width: ".5fr", sortable: true, template: `<address-link address.to-view="address" >
  
  ` },
      { field: "createdAt", width: ".5fr", headerText: "age", sortable: true, template: "${getFormattedTime(createdAt)}" },
      { field: "address", width: ".2fr", headerText: "TxID", sortable: false, template: "<etherscan-button href-text='View' address.to-view=\"address\" is-transaction=\"true\"></etherscan-button>" },
      { field: "address", width: ".25fr", sortable: false, headerText: "", template: `
  <div class="withdraw">
  <pbutton
  if.to-view="ethereumService.defaultAccountAddress === address && type === 'deposit'"
  type="secondary"
  click.delegate="withdraw(row)"
  >WITHDRAW</pbutton></div>  ` },
    ];

  data = [{
    address: "0xB0dE228f409e6d52DD66079391Dc2bA0B397D7cA",
    createdAt: new Date(),
    dao: {
      id: "dao-hash-4",
      name: "MyDAO",
      tokens: [
        {
          address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
          amount: "1123.12",
          instantTransferAmount: "40000000000000000000",
          vestedTransferAmount: "10000000000000000000",
          vestedFor: 5184000,
          cliffOf: 1728000,
          name: "Prime",
          symbol: "D2D",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
        },
        {
          address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
          amount: "1123.12",
          instantTransferAmount: "40000000000000000000",
          vestedTransferAmount: "10000000000000000000",
          vestedFor: 5184000,
          cliffOf: 1728000,
          name: "Prime",
          symbol: "D2D",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
        },
      ],
      social_medias: [
        {
          url: "http://social.one.io",
          name: "Twitter",
        },
        {
          url: "http://two.social.io",
          name: "Reddit",
        },
      ],
      representatives: [{address: "0xf525a861391e64d5126414434bFf877285378246"}],
      treasury_address: "0x438992F8fF23d808a1BdA06cEbB9f7388b12EB82",
      logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
    },
    depositId: 1234,
    token: {
      address: "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad",
      amount: "1123.12",
      instantTransferAmount: "40000000000000000000",
      vestedTransferAmount: "10000000000000000000",
      vestedFor: 5184000,
      cliffOf: 1728000,
      name: "Prime",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/21609/thumb/RJD82RrV_400x400.jpg?1639559164",
    },
    type: "deposit",
    txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
  },
  {
    address: "0xdb6A67C15a0f10E1656517c463152c22468B78b8",
    createdAt: new Date(),
    dao: {
      id: "dao-hash-5",
      name: "PrimeDAO",
      tokens: [{
        address: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
        name: "Prime (D2D)",
        symbol: "D2D",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/21609/small/RJD82RrV_400x400.jpg?1639559164",
        amount: "4354.12",
        instantTransferAmount: "150000",
        vestedTransferAmount: "50000",
        vestedFor: 14 * 24 * 3600, // should be in seconds
        cliffOf: 3 * 24 * 3600, // should be in seconds
      }],
      treasury_address: "0x0727d9de6838fa17Ce638E3Ba3483e8d25E99276",
      representatives: [{address: "0x21bF0f34752a35E989002c2e6A78D5Df6BC7aE6F"}],
      social_medias: [{name: "Twitter", url: "http://twitter.com/their-dao"}, {name: "Telegram", url: "http://telegram.com/their-dao"}],
      logoURI: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
    },
    depositId: 1234,
    token: {
      address: "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad",
      name: "Prime (D2D)",
      symbol: "D2D",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/21609/small/RJD82RrV_400x400.jpg?1639559164",
      amount: "3454.12",
      instantTransferAmount: "150000",
      vestedTransferAmount: "50000",
      vestedFor: 14 * 24 * 3600, // should be in seconds
      cliffOf: 3 * 24 * 3600, // should be in seconds
    },
    type: "withdraw",
    txid: "0xc6539832b952d3e37fcee30984806798bb7bbc737e2b567a40788b942acd6367",
  }];
}
