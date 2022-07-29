import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { bindable } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { FirestoreService } from "services/FirestoreService";
import { IDAOsData } from "services";

export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;

  private daosData: Record<string, IDAOsData>;
  private daos = [];
  availableSocialMedias = availableSocialMedias.map(item => ({text: item.name, value: item.name}));

  constructor(
    @IValidationController private form: IValidationController,
    private firestoreService: FirestoreService<any, any>,
  ) {}

  addRepresentative() {
    this.data.representatives.push({address: ""});
  }

  removeRepresentative(index: number) {
    this.data.representatives.splice(index, 1);
    this.form.revalidateErrors();
  }

  addSocialMedia() {
    this.data.social_medias.push({name: "", url: ""});
  }

  removeSocialMedia(index: number) {
    this.data.social_medias.splice(index, 1);
    this.form.revalidateErrors();
  }

  attached() {
    this.hydrateDaosList();
  }

  private prepareAvatarUrl(url) {
    const pathParts = url.split("/");
    if (url.includes("https://")) return url;
    return "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/" + pathParts[pathParts.length - 1];
  }

  async hydrateDaosList(): Promise<boolean> {
    this.daosData = await this.firestoreService.allDeepDaoOrgs();

    this.daos = Object.keys(this.daosData).map(id => ({
      text: this.daosData[id].name,
      innerHTML: this.daosData[id].avatarUrl
        ? `<span><img src="${this.prepareAvatarUrl(this.daosData[id].avatarUrl)}" alt="${this.daosData[id].name}" height="20" /> ${this.daosData[id].name}</span>`
        : `<span><div style="display: block; width: 20px; height: 20px; border-radius: 50%; background-color: yellow;"></div> ${this.daosData[id].name}</span>`,
      treasury: this.daosData[id].treasuryAddresses,
      value: id,
    }));
    return true;
  }
}
