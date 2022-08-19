/**
 * Based on DeepDAO's API response. See:
 * /v0.1/organizations
 * https://api.deepdao.io/#/1.%20Organizations/OrganizationController_find
 * Note: requires authentication
 */
export interface IDeepDaoGovernanceItem {
  platform: string,
  id: string,
  name: string,
  address: string,
}

export interface IDeepDaoOrganization {
  organizationId: string,
  name: string,
  description: string,
  logo: string,
  members: number
  activeMembers: number,
  proposals: number,
  votes: number,
  tokens: string[],
  governance: IDeepDaoGovernanceItem[],
  updatedAt: Date,
}

export interface IDeepDaoOrganizations {
  totalResources: number,
  resources: IDeepDaoOrganization[],
}
