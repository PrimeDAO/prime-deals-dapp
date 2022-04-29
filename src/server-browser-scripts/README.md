*Quick links: --- [How to add new seed data](#how-to-add-new-seed-data)*


# Seed data

## How to execute the script
1. package.json scripts
`npm run seed-build`
`npm run seed-run`

2. In the UI
Non-prod instances have a button "Reset Deals", which will reset all Deals to their canonical form (and remove newly created ones).

## How to add new seed data
You need consider up to 3 steps:
- Generating new seed data
- Location - Where does the seed data live?
- Code modifications - What places to change when new seed data was added?

### Generating new seed data
There are 3 parts to this which are specified in the type `ResetDeal` ([`seed-data.ts`](./seed-data.ts)):

1. Follow the interface `IDealRegistrationTokenSwap`
2. Control deal ids generation via field `dealId`
2. Control votes via field `quorumReached`

Note: You can generate either one single .json object or a .json array.

### Location - Where does the seed data live?
`/test/data`

### Code modifications - What places to change when new seed data was added?
[`test/data/index.ts`](../../test/data/index.ts)


