import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { bindable, inject, observable } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { FirestoreService } from "services/FirestoreService";
import { IDAOsData } from "services";
import { ethers } from "ethers";
import { Utils } from "services/utils";
import "cl-webcomp-poc";

interface IAutoCompleteSelectItem {
  name: string,
  avatarUrl?: string,
  id: string,
  treasury?: string[],
}

interface IAutoCompleteSelectEvent extends Event {
  detail: IAutoCompleteSelectItem
}

enum DropdownEvent {
  SelectionChanged= "daoSelectionChanged",
  NewAdded= "newDaoAdded",
  Cleared= "inputCleared",
}

const LAST_1_DAY = Date.now() - (24 * 60 * 60 * 1000);
const DAO_PLACEHODER_AVATAR = "DAO_placeholder.svg";
@inject()
export class DaoStageContent {
  @bindable name: string;
  @bindable disabled = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;

  private daosData: Record<string, IDAOsData>;
  private daosList = [];
  private daoListStr: string = "[]";
  private treasuryAddresses = [];
  private treasuryAddressesList = [];
  private treasurySelected: string;
  private daoSelected: string;
  private refSelectDAO: HTMLElement;
  @observable private refSelectTreasury: HTMLElement = null;
  private isFromDeepDAO = false;
  private isLoadingDAO = false;
  private isNewDAO = false;

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

  private async resolveAddresses (mixedEnsAndAddresses: string[]): Promise<{ name: string, value: string }[]> {
    const res = mixedEnsAndAddresses.map(async (item) => {
      const address = await this.resolveENS(item);
      return {
        name: `${item}${address ? " (" + Utils.smallHexString(address) + ")" : ""}`,
        value: address ?? item,
      };
    });

    return Promise.all(res);
  }

  async refSelectTreasuryChanged(newInputSelectElement) {
    if (newInputSelectElement && this.treasuryAddresses) {
      const options = (await this.resolveAddresses(this.treasuryAddresses))
        .map( address => ({
          name: address.name,
          avatarUrl: "",
          id: address.value,
          treasury: []}),
        );
      newInputSelectElement.setAttribute("options", JSON.stringify(options));
      newInputSelectElement.addEventListener(DropdownEvent.SelectionChanged, async (e: IAutoCompleteSelectEvent) => {
        this.data.treasury_address = e.detail.id;
        this.form.revalidateErrors();
      });

      newInputSelectElement.addEventListener(DropdownEvent.Cleared, () => {
        this.data.treasury_address = "";
      });
    }
  }

  resetDeepDAO(){
    this.isFromDeepDAO = false;
    this.isLoadingDAO = false;
  }

  attached() {
    if (this.hydrateDaosList()) {
      this.refSelectDAO.setAttribute("options", this.daoListStr);
    }

    this.refSelectDAO.addEventListener(DropdownEvent.SelectionChanged, async (e: IAutoCompleteSelectEvent) =>
    {
      if (!this.isNewDAO) {
        this.isLoadingDAO = true;
        this.isFromDeepDAO = true;
      }
      this.isNewDAO = false;

      this.treasuryAddresses = e.detail.treasury || [];
      if (this.treasuryAddresses.length === 1) {
        this.data.treasury_address = await this.resolveENS(this.treasuryAddresses[0]);
      }
      this.data.name = e.detail.name;
      this.data.logoURI = e.detail.avatarUrl === DAO_PLACEHODER_AVATAR ? "" : e.detail.avatarUrl;
      this.data.deepDAOId = e.detail.id;
      this.isLoadingDAO = false;
      this.form.revalidateErrors();
    });

    this.refSelectDAO.addEventListener(DropdownEvent.NewAdded, async (e: IAutoCompleteSelectEvent) =>
    {
      this.treasuryAddresses = [];
      this.data.name = e.detail.name;
      this.data.treasury_address = "";
      this.isFromDeepDAO = false;
      this.data.logoURI = "";
      this.data.deepDAOId = "";

      this.isNewDAO = true;
      this.resetDeepDAO();
    });

    this.refSelectDAO.addEventListener(DropdownEvent.Cleared, () => {
      this.data.name = "";
      this.data.treasury_address = "";
      this.treasuryAddresses = [];
      this.data.logoURI = "";
      this.data.deepDAOId = "";
      this.isFromDeepDAO = false;
    });

  }

  async hydrateDaosList(): Promise<boolean> {
    const cachedDAOsList = JSON.parse(localStorage.getItem("daosData"));
    if (!cachedDAOsList || cachedDAOsList.date < LAST_1_DAY) {
      this.daosData = await this.firestoreService.allDeepDaoOrgs();
      localStorage.setItem("daosData", JSON.stringify({
        date: Date.now(),
        data: this.daosData,
      }));
    } else {
      this.daosData = cachedDAOsList.data;
    }
    this.daosList = Object.keys(this.daosData).map(id => ({
      name: this.daosData[id].name,
      avatarUrl: this.daosData[id].avatarUrl || DAO_PLACEHODER_AVATAR,
      id,
      treasury: this.daosData[id].treasuryAddresses,
    }));
    this.daoListStr = JSON.stringify(this.daosList);
    return typeof JSON.parse(this.daoListStr) === "object";
  }
}
