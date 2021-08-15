import { BaseStage } from "registry-wizard/baseStage";
import { Utils } from "services/utils";

export class Stage2 extends BaseStage {

  // Add a link object to the link object arrays
  addAdmin(): void {
    // Create a new social media object
    this.seedConfig.admins.push({address: undefined, represent: undefined});
  }
  // Delete a row in the social media array
  deleteAdmin(index:number): void {
    // Remove the indexed link
    this.seedConfig.admins.splice(index, 1);
  }

  addSocialMedia(daoIndex: number): void {
    // Create a new social media object
    this.seedConfig.daos[daoIndex].social_medias.push({name: undefined, url: undefined});
  }
  // Delete a row in the social media array
  deleteSocialMedia(daoIndex:number, index:number): void {
    // Remove the indexed link
    this.seedConfig.daos[daoIndex].social_medias.splice(index, 1);
  }

  addToken(daoIndex: number): void {
    // Create a new token object
    this.seedConfig.daos[daoIndex].tokens.push({name: undefined, amount: undefined});
  }
  // Delete a row in the tokens array
  deleteToken(daoIndex: number, index:number): void {
    // Remove the indexed link
    this.seedConfig.daos[daoIndex].tokens.splice(index, 1);
  }

  validateInputs(): Promise<string> {
    let message: string;
    if (!this.seedConfig.daos[0].name) {
      message = `Please enter a name DAO ${0 + 1}`;
    }
    // Validate the tokens
    this.seedConfig.daos[0].tokens.forEach((token: {name:string, amount:number}) => {
      if (!token.name) {
        // Current input as not been filled out
        message = "Please enter a name for the token";
      } else if (!token.amount) {
        // Current input as not been filled out
        message = `Please enter funding amount for the token ${token.name}`;
      }
    });

    // Validate the links
    this.seedConfig.daos[0].social_medias.forEach((platform: {name:string, url:string}) => {
      if (!platform.name) {
        // Current input as not been filled out
        message = "Please enter a name of a platform";
      } else if (!Utils.isValidUrl(platform.url, false)) {
        // Current input as not been filled out
        message = `Please enter a valid URL for ${platform.name}`;
      }
    });

    this.stageState.verified = !message;
    return Promise.resolve(message);
  }
}
