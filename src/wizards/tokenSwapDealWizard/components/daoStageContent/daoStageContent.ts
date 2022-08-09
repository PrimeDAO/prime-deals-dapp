import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { bindable, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { FirestoreService } from "services/FirestoreService";
import { IDAOsData } from "services";
import { ethers } from "ethers";
import { Utils } from "services/utils";

@inject()
export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;

  private daosData: Record<string, IDAOsData>;
  private daosList = [];
  private treasuryAddressesList = [];
  // private treasurySelected: string;
  private daoSelected: string;

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

  async resolveENS(name: string): Promise<string> {
    const provider = new ethers.providers.EtherscanProvider(1, process.env.ETHERSCAN_KEY);

    if (ethers.utils.isValidName(name) && !ethers.utils.isAddress(name)) {
      const address = await provider.resolveName(name);
      return address || name;
    }
  }

  private async resolveAddresses (mixedEnsAndAddresses: string[]): Promise<{ text: string, value: string}[]> {
    const res = mixedEnsAndAddresses.map(async (item) => {
      const address = await this.resolveENS(item);
      return { text: `${item} ${address ? "(" + Utils.smallHexString(address) + ")" : ""}`, value: address };
    });

    return Promise.all(res);
  }

  async updateContent ($event): Promise<void>
  {
    const { avatarUrl, name, treasuryAddresses } = this.daosData[$event];
    this.treasuryAddressesList = await this.resolveAddresses(treasuryAddresses);

    this.data = {
      ...this.data,
      logoURI: avatarUrl || "",
      treasury_address: this.treasuryAddressesList[this.data.treasury_address] || "",
      name: name || this.daoSelected,
    };
  }

  async updateTreasury($event): Promise<void> {
    const value = this.daosData[this.data.name].treasuryAddresses[$event];
    this.data.treasury_address = value;
  }

  attached() {
    this.hydrateDaosList();
  }

  async hydrateDaosList(): Promise<boolean> {
    const cachedDAOsList = JSON.parse(localStorage.getItem("daosData"));
    if (!cachedDAOsList || cachedDAOsList.date < (Date.now() - (24 * 60 * 60 * 1000))) {
      this.daosData = await this.firestoreService.allDeepDaoOrgs();
      localStorage.setItem("daosData", JSON.stringify({
        date: Date.now(),
        data: this.daosData,
      }));
    } else {
      this.daosData = cachedDAOsList.data;
    }
    this.daosList = Object.keys(this.daosData).map(id => ({
      text: this.daosData[id].name,
      innerHTML: `<span><img src="${this.daosData[id].avatarUrl ? this.daosData[id].avatarUrl : "DAO_placeholder.svg"}" alt="${this.daosData[id].name}" height="20" /> ${this.daosData[id].name}</span>`,
      treasury: this.daosData[id].treasuryAddresses,
      value: id,
    }));
    return true;
  }
}
