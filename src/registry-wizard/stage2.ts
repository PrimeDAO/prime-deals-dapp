import { BaseStage } from "registry-wizard/baseStage";
import { Utils } from "services/utils";
import { IDAO } from "./dealConfig";
import { IDaoAPIObject } from "../services/DealService";
import { bindable } from "aurelia-typed-observable-plugin";

export class Stage2 extends BaseStage {
  @bindable daoList: Array<IDaoAPIObject> = this.dealService.DAOs;

  attached(): void {
    if (!this.daoList) this.dealService.getDAOsInformation().then(() => {
      this.daoList = this.dealService.DAOs.sort((a: any, b: any) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    }).catch((err) => {
      console.error("err", err);
    });
  }

  // Add a link object to the link object arrays
  addAdmin(): void {
    // Create a new social media object
    this.dealConfig.admins.push({address: undefined, represent: undefined});
  }
  // Delete a row in the social media array
  deleteAdmin(index:number): void {
    // Remove the indexed link
    this.dealConfig.admins.splice(index, 1);
  }

  addSocialMedia(daoIndex: number): void {
    // Create a new social media object
    this.dealConfig.daos[daoIndex].social_medias.push({name: undefined, url: undefined});
  }
  // Delete a row in the social media array
  deleteSocialMedia(daoIndex:number, index:number): void {
    // Remove the indexed link
    this.dealConfig.daos[daoIndex].social_medias.splice(index, 1);
  }

  addToken(daoIndex: number): void {
    // Create a new token object
    this.dealConfig.daos[daoIndex].tokens.push({name: undefined, amount: undefined});
  }
  // Delete a row in the tokens array
  deleteToken(daoIndex: number, index:number): void {
    // Remove the indexed link
    this.dealConfig.daos[daoIndex].tokens.splice(index, 1);
  }

  validateInputs(): Promise<string> {
    let message: string;
    this.dealConfig.daos.forEach((dao:IDAO, idx:number) => {
      if (!dao.name) {
        message = `Please enter a name for DAO ${(idx + 1)}`;
      }

      if (!message) {
        // Validate the tokens
        dao.tokens.forEach((token: {name:string, amount:number}) => {
          if (!token.name) {
            // Current input as not been filled out
            message = `Missing a token name by  ${dao.name || "DAO " + (idx + 1)}`;
          } else if (!token.amount) {
            // Current input as not been filled out
            message = `Missing funding amount for the token ${token.name} by ${dao.name || "DAO " + (idx + 1)}`;
          }
        });
      }

      if (!message) {
        // Validate the links
        dao.social_medias.forEach((platform: {name:string, url:string}) => {
          if (!platform.name) {
            // Current input as not been filled out
            message = `Missing a social media name by ${dao.name || "DAO " + (idx + 1)}`;
          } else if (!Utils.isValidUrl(platform.url, false)) {
            // Current input as not been filled out
            message = `Invalid URL for the social media ${platform.name} by ${dao.name || "DAO " + (idx + 1)}`;
          }
        });
      }
    });

    this.stageState.verified = !message;
    return Promise.resolve(message);
  }
}
