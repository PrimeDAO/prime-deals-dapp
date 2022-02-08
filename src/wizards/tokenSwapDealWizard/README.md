# Deal Wizards

## Add a Deal Wizard
1. Create new route (for example in `app.ts`) for example:
  ```
  {
    moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
    route: `/initiate/token-swap/open-proposal/*${STAGE_ROUTE_PARAMETER}`,
    nav: false,
    name: "createOpenProposal",
    title: "Create an Open Proposal",
    settings: {
      wizardType: WizardType.openProposal,
    },
  },
  ```
2. In `WizardManager` class create a new property which is an array of stages (actually stages configurations) that are going to be used by the new wizardType:
  ```
  private openProposalStages: IWizardStage[] = [
    this.proposalStage,
    this.proposalLeadStage,
    this.primaryDaoStage,
  ];
  ```
3. Update `configureStages` method in the `wizardManager.ts` to return an array of correct stage components for the wizardType that is used by the Deal Wizard that is being created
  ```
  // note this is just a fragment on the configureStages method
  switch (wizardType) {
    case WizardType.openProposal:
      stages = this.openProposalStages;
      break;
  }
  ```

## Add new stage to a wizardType

1. After creating a stage component, add new stage stage configuration object (`IWizardStage`) for it in the `wizardManger.ts` for example:
  ```
  private partnerDaoStage: IWizardStage = {
    name: "Partner DAO",
    valid: false,
    route: "partner-dao",
    moduleId: PLATFORM.moduleName("./stages/partnerDaoStage/partnerDaoStage"),
  };
  ```
2. Update stages arrays for each wizardType that is going to use the new stage, which the created stage configuration object. Example:
```
  // wizard type that need to get new stage
  private partneredDealStages = [
    ... 
    this.partnerDaoStage, // place new stage where appropriate
    ...
  ];
```
