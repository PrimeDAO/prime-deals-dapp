import { IDAO } from "entities/DealRegistrationTokenSwap";
import { bindable } from "aurelia";

export class DaoInformation {
  @bindable daoData: IDAO;

  private isEmptySocialMedia(): boolean {
    if (this.daoData.social_medias.length === 0) return true;

    if (this.daoData.social_medias.length === 1) {
      const emptyName = this.daoData.social_medias[0].name === "";
      const emptyUrl = this.daoData.social_medias[0].url === "";
      const isEmpyt = emptyName && emptyUrl;
      return isEmpyt;
    }

    return false;
  }
}
