import { IDAO } from "entities/DealRegistrationTokenSwap";
import { availableSocialMedias } from "../../dealWizardTypes";
import { bindable, inject, observable } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { FirestoreService } from "services/FirestoreService";
import { IDAOsData } from "services";
import { ethers } from "ethers";
import { EnsService } from "services";
import { Utils } from "services/utils";
import "cl-webcomp-poc";

interface IAutocompleteSelectItem {
  name: string,
  avatarUrl?: string,
  id: string,
  treasury?: string[],
}

interface IAutocompleteSelectEvent extends Event {
  detail: IAutocompleteSelectItem
}

interface ITreasuryAddressItem {
  name: string,
  value: string
}

enum AutocompleteSelectEvent {
  SelectionChanged= "daoSelectionChanged",
  NewAdded= "newDaoAdded",
  Cleared= "inputCleared",
}

const LAST_1_DAY = Date.now() - (24 * 60 * 60 * 1000);
const DAO_PLACEHOLDER_AVATAR = "DAO_placeholder.svg";

@inject()
export class DaoStageContent {
  @bindable name: string;
  @bindable disabled: boolean = false;
  @bindable data: IDAO;
  @bindable dataMata: number;
  @bindable someTest: number;

  private daosData: Record<string, IDAOsData>;
  private daosList: IAutocompleteSelectItem[] = [];
  private daoListStr: string = "[]";
  private treasuryAddresses: string[] = [];
  private refSelectDAO: HTMLElement;
  @observable private refSelectTreasury: HTMLElement = null;
  private isFromDeepDAO:boolean = false;
  private isLoadingDAO:boolean = false;
  private isHydrated: boolean = false;

  availableSocialMedias = availableSocialMedias.map(item => ({text: item.name, value: item.name}));

  constructor(
    @IValidationController private form: IValidationController,
    private firestoreService: FirestoreService<any, any>,
    private ensService: EnsService,
  ) {
    this.hydrateDaosList();
  }

  addRepresentative() {
    this.data.representatives.push({address: ""});
  }

  removeRepresentative(index: number) {
    this.data.representatives.splice(index, 1);
    this.form.revalidateErrors();
  }

  addSocialMedia(): void {
    this.data.social_medias.push({name: "", url: ""});
  }

  removeSocialMedia(index: number): void {
    this.data.social_medias.splice(index, 1);
    this.form.revalidateErrors();
  }

  private async resolveAddresses (mixedEnsAndAddresses: string[]): Promise<ITreasuryAddressItem[]> {
    const res = mixedEnsAndAddresses.map(async (item: string): Promise<ITreasuryAddressItem> => {
      const address = await this.ensService.getAddressForEns(item);
      return {
        name: `${item}${!ethers.utils.isAddress(item) && ethers.utils.isAddress(address) ? " (" + Utils.smallHexString(address) + ")" : ""}`,
        value: ethers.utils.isAddress(address) ? address : "",
      };
    });
    return (await Promise.all(res)).filter((item: ITreasuryAddressItem) => item.value);
  }

  private get isValidTreasuryAddress(): boolean {
    return ethers.utils.isAddress(this.data.treasury_address);
  }

  async refSelectTreasuryChanged(newInputSelectElement): Promise<void> {
    if (newInputSelectElement && this.treasuryAddresses) {
      const options = (await this.resolveAddresses(this.treasuryAddresses))
        .map( (address: ITreasuryAddressItem): IAutocompleteSelectItem => ({
          name: address.name,
          avatarUrl: "",
          id: address.value,
          treasury: []}),
        );
      newInputSelectElement.setAttribute("options", JSON.stringify(options));
      newInputSelectElement.addEventListener(AutocompleteSelectEvent.SelectionChanged, async (e: IAutocompleteSelectEvent) =>
      {
        this.data.treasury_address = e.detail.id;
        this.form.revalidateErrors();
      });

      const currentOption = options.find((option: IAutocompleteSelectItem) => (option.id === this.data.treasury_address));
      if (currentOption?.name) newInputSelectElement.setAttribute("value", currentOption.name);

      newInputSelectElement.addEventListener(AutocompleteSelectEvent.Cleared, (): void => {
        this.data.treasury_address = "";
      });
    }
  }
  
  setCommonDeepDaoDefaults(): void {
    this.treasuryAddresses = [];
    this.data.logoURI = "";
    this.data.treasury_address = "";
    this.isFromDeepDAO = false;
  }

  async attached(): Promise<void> {
    if (!this.isHydrated) await this.hydrateDaosList();
    this.refSelectDAO.setAttribute("options", this.daoListStr);
    this.refSelectDAO.setAttribute("value", this.data.name);
    this.isFromDeepDAO = this.data.deepDAOId && !this.data.deepDAOId.startsWith("custom-dao-");

    this.refSelectDAO.addEventListener(AutocompleteSelectEvent.SelectionChanged, async (e: IAutocompleteSelectEvent): Promise<void> =>
    {
      if (!e.detail.id.startsWith("custom-dao-")) {
        this.isLoadingDAO = true;
        this.isFromDeepDAO = true;
      }

      this.treasuryAddresses = e.detail.treasury || [];
      if (this.treasuryAddresses.length === 1) {
        const resolvedAddress = await this.ensService.getAddressForEns(this.treasuryAddresses[0]);
        this.data.treasury_address = ethers.utils.isAddress(resolvedAddress) ? resolvedAddress : "";
      }
      this.data.name = e.detail.name;
      this.data.logoURI = e.detail.avatarUrl === DAO_PLACEHOLDER_AVATAR ? "" : e.detail.avatarUrl;
      this.data.deepDAOId = e.detail.id;
      this.isLoadingDAO = false;
      this.form.revalidateErrors();
    });

    this.refSelectDAO.addEventListener(AutocompleteSelectEvent.NewAdded, async (e: IAutocompleteSelectEvent): Promise<void> =>
    {
      this.setCommonDeepDaoDefaults();
      this.data.name = e.detail.name;
      this.data.deepDAOId = e.detail.id;
      this.isLoadingDAO = false;
    });

    this.refSelectDAO.addEventListener(AutocompleteSelectEvent.Cleared, (): void => {
      this.setCommonDeepDaoDefaults();
      this.data.name = "";
      this.data.deepDAOId = "";
    });

  }

  async hydrateDaosList(): Promise<void> {
    const cachedDAOsList = JSON.parse(localStorage.getItem("daosData"));
    if (!cachedDAOsList || cachedDAOsList.date < LAST_1_DAY) {
      this.daosData = (await this.firestoreService.allDeepDaoOrgs());
      localStorage.setItem("daosData", JSON.stringify({
        date: Date.now(),
        data: this.daosData,
      }));
    } else {
      this.daosData = cachedDAOsList.data;
    }
    this.daosList = Object.keys(this.daosData)
      .map((id: string): IAutocompleteSelectItem => {
        const dao: IAutocompleteSelectItem = {
          name: this.daosData[id].name.trim(),
          avatarUrl: this.daosData[id].avatarUrl || DAO_PLACEHOLDER_AVATAR,
          id,
          treasury: [...this.daosData[id].treasuryAddresses],
        };
        return dao;
      })
      .filter((dao: IAutocompleteSelectItem) => !!dao.name)
      .sort((a: IAutocompleteSelectItem, b: IAutocompleteSelectItem) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    this.daoListStr = JSON.stringify(this.daosList);

    if (this.data?.name) {
      const currentDAO = this.daosList.find((dao: IAutocompleteSelectItem): boolean => dao.name === this.data.name);
      if (currentDAO) {
        this.treasuryAddresses = currentDAO.treasury;
      }
    }
  }
}
