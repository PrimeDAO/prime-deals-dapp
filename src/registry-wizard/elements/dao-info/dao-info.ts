import { IDaoAPIObject } from "services/DealService";
import { BaseStage } from "registry-wizard/baseStage";
import { customElement } from "aurelia-framework";
import { IToken, DealConfig } from "registry-wizard/dealConfig";
import { bindable } from "aurelia-typed-observable-plugin";

@customElement("dao-info")
export class DaoInfo extends BaseStage {
  @bindable index: number;
  // @bindable daoList: Array<IDaoAPIObject> = this.dealService.DAOs;
  @bindable tokenList: Array<IToken>;
  @bindable daoId: string;
  @bindable tokenId: string;
  @bindable dao: IDaoAPIObject
  private refDaoSelect: Array<HTMLSelectElement>;
  // private tokens: Array<IToken> = this.dao.tokens;

  dealConfig: DealConfig;
  isLoading = false;
  isLoadingTokens = false;

  daoIdChanged():void {
    if (!this.daoId) return;

    this.isLoadingTokens = true;
    this.dao.tokens.splice(1); // remove previous selected tokens
    this.dealService.getDAOsTokenList(this.daoId).then((tokens) => {
      this.tokenList = tokens;
      this.isLoadingTokens = false;
    }).catch((err) => {
      this.isLoadingTokens = false;
      console.error("err", err);
    });

  }
  attached(): void {
    this.isLoading = true;
    if (!this.daoList) this.dealService.getDAOsInformation().then(() => {
      this.daoList = this.dealService.DAOs
        .sort((a: any, b: any) =>
          a.daoName.toLowerCase().localeCompare(b.daoName.toLowerCase()),
        );
      this.isLoading = false;
    }).catch((err) => {
      console.error("err", err);
    });
  }

  addToken(daoIndex: number): void {
    // Create a new token object
    this.dao.tokens.push({name: undefined, balance: undefined, symbol: undefined, address: undefined});
  }
  // Delete a row in the tokens array
  deleteToken(daoIndex: number, index:number): void {
    // Remove the indexed link
    this.dao.tokens.splice(index, 1);
  }

}
