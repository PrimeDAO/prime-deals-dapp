# Prime Deals dApp
Prime Deals is an An Interface for DAO to DAO interactions, such as token swaps, co-liquidity provision, and joint venture formation. An introduction to Prime Deals [TODO: ADD LINK](link-to-introduction).

This prime-deals-dapp repository contains in its master branch the web user interface for the Prime Deals website that is deployed to https://deals.prime.xyz.

## Development

### Prerequisites
Make sure you have [node.js version >= 14.11.0 < 15](https://nodejs.org/en/)

### Install
Install dependencies with the following command:
```
npm ci
```
### Update Contract ABIs
Prime Deals relies on solidity contract addresses and ABIs that it obtains from the [PrimeDao contracts-v2 repository](https://github.com/PrimeDAO/contracts-v2). You must clone the contracts-v2 repository in a folder sibling to this one.

Then run the following script to pull the required contract ABIs from contracts:
```
npm run fetchContracts
```
You only need run this script once, or else again when any of the contracts change.

### Build
The package.json file contains lots of commands for building or serving up the application.

#### Environment
Before building, make sure to have the following in your OS environment variables or in an ".env" file:
```
RIVET_ID=...
ETHERSCAN_KEY=...

PINATA_API_KEY=...
PINATA_SECRET_API_KEY=...

PINATA_API_KEY_TEST=...
PINATA_SECRET_API_KEY_TEST=...

IPFS_GATEWAY=https://primedao.mypinata.cloud/${protocol}/${hash}
COINGECKO_API_KEY=...
```

>When building for production, the build will look for variables in ".env.production".

Following are the two most commonly used commands:

#### Build and serve unoptimized code against rinkeby
Best for development and debugging, the output goes to webpack-dev-server for use with your favorate debugger, like VSCode:
```
npm run serve-dev
```
#### Build with optimized code against mainnet
The production build, output goes to the `dist` folder:
```
npm run build
```
After successfully building, run the following to serve up the output so you can see it in the browser:
```
npm run start
```
### Lint
To confirm that lint succeeds before git commits run
```
npm run lint
```
To have lint automatically fix all  fixable errors run
```
npm run lint.fix
```
### Automated Tests
Run
```
npm run test
```
To run in watch mode
```
npm run test --watch
```
### Webpack Analyzer
To run the Webpack Bundle Analyzer for production build.
```
npm run analyze
```
### Dependencies
Various code dependencies include:
* Token information - etherscan.io, at api.etherscan.io/api
* Token information - coingecko, at pro-api.coingecko.com/api/v3
* IPFS gateway - primedao.mypinata.cloud
* Wallet providers - [Web3Modal](https://github.com/Web3Modal/web3modal)
* Interactions with Ethereum and wallet providers - [ethers.js](https://docs.ethers.io/v5/)
* Mainnet web3 provider - [Rivet](https://rivet.cloud/)

## Architecture
### Technical Description
The project framework is [Aurelia](https://aurelia.io).

It is written mostly in Typescript, HTML and SCSS, and is bundled using Webpack.

## Community
[Join our Discord](https://discord.gg/primedao) and ask how you can get involved with PrimeDAO
