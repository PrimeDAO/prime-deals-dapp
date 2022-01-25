import { IWizardData } from "services/WizardService";

export const MAKE_OFFER_WIZARD_MOCK: IWizardData = {
  version: "0.0.1",
  proposal: {
    title: "First Proposal",
    summary: "Lorem ipsum summary",
    description: "Lorem ipsum description dolor sit amet",
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  primaryDAO: {
    id: "",
    members: [""],
    name: "Primary DAO",
    tokens: [{
      name: "",
      symbol: "",
      balance: "",
      address: "",
    }],
    social_medias: [{name: undefined, url: undefined}],
    logo_url: null,
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  partnerDAO: {
    id: "",
    members: [""],
    name: "",
    tokens: [{
      name: "",
      symbol: "",
      balance: "",
      address: "",
    }],
    social_medias: [{name: undefined, url: undefined}],
    logo_url: null,
  },
  proposalLead: {
    address: "0x123123123",
    email: "",
  },
  isPrivate: true,
  createdAt: null,
  modifiedAt: null,
  createdByAddress: null,
};

export const OPEN_PROPOSAL_WIZARD_MOCK: IWizardData = {
  version: "0.0.1",
  proposal: {
    title: "",
    summary: "",
    description: "",
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  primaryDAO: {
    id: "",
    members: [""],
    name: "",
    tokens: [{
      name: "",
      symbol: "",
      balance: "",
      address: "",
    }],
    social_medias: [{name: undefined, url: undefined}],
    logo_url: null,
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  partnerDAO: {
    id: "",
    members: [""],
    name: "",
    tokens: [{
      name: "",
      symbol: "",
      balance: "",
      address: "",
    }],
    social_medias: [{name: undefined, url: undefined}],
    logo_url: null,
  },
  proposalLead: {
    address: "",
    email: "",
  },
  keepAdminRights: true,
  offersPrivate: true,
  createdAt: null,
  modifiedAt: null,
  createdByAddress: null,
};
