import { Address, AllowedNetworks } from "./EthereumService";
import { inject } from "aurelia";

interface IContractInfo {
  address: Address;
  abi: Array<any>;
}

interface IContractInfosJson {
  name: AllowedNetworks;
  chainId: number;
  contracts: {
    [name: string]: IContractInfo;
  }
}

interface ISharedContractInfos {
  [name: string]: Array<any>;
}

@inject()
export class ContractsDeploymentProvider {

  private static contractInfosJson: IContractInfosJson;
  private static sharedContractAbisJson: ISharedContractInfos;

  public static initialize(targetedNetwork: string): void {
    if (!ContractsDeploymentProvider.contractInfosJson) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ContractsDeploymentProvider.contractInfosJson = require(`../contracts/${targetedNetwork}.json`) as IContractInfosJson;
      console.dir("HEEEEERE: ", ContractsDeploymentProvider.contractInfosJson);
    }

    if (!ContractsDeploymentProvider.sharedContractAbisJson) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ContractsDeploymentProvider.sharedContractAbisJson = require("../contracts/sharedAbis.json") as ISharedContractInfos;
    }
  }

  public static getContractAbi(contractName: string): Array<any> {
    let abi = ContractsDeploymentProvider.contractInfosJson.contracts[contractName]?.abi;
    if (typeof abi === "string") {
      // is name of shared abi, such as ERC20
      abi = ContractsDeploymentProvider.sharedContractAbisJson[abi];
    } else if (!abi) {
      abi = ContractsDeploymentProvider.sharedContractAbisJson[contractName];
    }
    return abi;
  }

  public static getContractAddress(contractName: string): Address {
    return ContractsDeploymentProvider.contractInfosJson.contracts[contractName]?.address;
  }
}
