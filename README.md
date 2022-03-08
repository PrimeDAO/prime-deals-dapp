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

FIREBASE_API_KEY=     # apiKey
FIREBASE_AUTH_DOMAIN= # authDomain
FIREBASE_PROJECT_ID=  # projectId
FIREBASE_APP_ID=      # appId
FIREBASE_FUNCTIONS_URL=http://localhost:5001/${projectId}/us-central1
```

>When building for production, the build will look for variables in ".env.production".

Following are the three most commonly used commands:

#### Build and serve unoptimized code against rinkeby
Best for development and debugging, the output goes to webpack-dev-server for use with your favorate debugger, like VSCode:
```
npm run serve-dev
```
#### Run Firebase emulators
For fast and safe development use firebase emulator suite instead of connecting to a real project.
App is going to use emulated firebase services automatically, but if some/all of them are not available
it will call the real service instead. 
```
npm run firebase
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

**Further readings:**
- Unit tests in `/test` - [readme](./test/README.md)
- E2E tests in `/cypress` - [readme](./cypress/README.md)

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

## Firebase

### Firebase Local development environment setup

Assuming that a Firebase Project is already setup and you have access to API key and other secrets (otherwise see [how to setup a new project](#new-firebase-project-setup))

1. Add Firebase environment variables to `.env` file. You can find them in the Firebase console [https://console.firebase.google.com](https://console.firebase.google.com/) Under “Project settings” → “Your apps” → select the app you want to use
    
    ```
    FIREBASE_API_KEY=     # apiKey
    FIREBASE_AUTH_DOMAIN= # authDomain
    FIREBASE_PROJECT_ID=  # projectId
    FIREBASE_APP_ID=      # appId
    ```
    
2. Use Firebase emulators for development
    1. Run `npm run firebase` to start firebase emulators
        1. It will output information about running firebase emulators. Make sure that Authentication, Functions and Firestore emulators are running. Emulator UI should be available at http://localhost:4000
        2. It will output URLs for the locally deployed functions
        
        ```
        functions[us-central1-functionName]: http function initialized 
        (http://localhost:5001/${projectId}/us-central1/${functionName}).
        ```
        
    2. When running it for the first time copy the outputted functions URL without the function name (with the last part), for example:
        
        `http://localhost:5001/${projectId}/us-central1`
        
        Add it to `.env` as `FIREBASE_FUNCTIONS_URL` variable:
        
        `FIREBASE_FUNCTIONS_URL=http://localhost:5001/${projectId}/us-central1`
        
3. Run `npm run start-dev` the app should be now using firebase emulators
4. You should always run `npm run firebase` and `npm run start-dev` for local development
5. Deployment from you local machine (optional)
    1. Install firebase cli on your machine `npm install -g firebase-tools`
    2. Login to firebase, run `firebase login`

### New Firebase Project setup

1. Create a new Firebase project
2. Upgrade it to “Blaze” plan (or any plan that allows us to use Firestore, Functions and Authentication, as of 03/2022 Blaze is the only one)
3. Go to Firebase console [https://console.firebase.google.com](https://console.firebase.google.com/)
4. Add new app for the Web
5. Copy provided secrets to environment variables (to your local .env or to Vercel Environment Variables)
    
    ```
    FIREBASE_API_KEY=     # apiKey
    FIREBASE_AUTH_DOMAIN= # authDomain
    FIREBASE_PROJECT_ID=  # projectId
    FIREBASE_APP_ID=      # appId
    ```
    
6. Setup Authentication
    1. Add “Email/password” sign-in method (We are not going to use email/password to sign in users, but we need at least one sign-in method to be enabled in order for our custom sign-in to work)
7. Setup Firestore Database
    1. Follow create database flow
    2. Under "Secure rules for Cloud Firestore” select "Start in production mode” which will disable all reads and writes
    3. Select Firestore location that makes the most sense for the project
8. Update Google Cloud IAM settings
    1. Open [https://console.cloud.google.com/iam-admin/iam](https://console.cloud.google.com/iam-admin/iam) and select the correct project, choose “Permissions” tab and view by “principals”
    2. Select one with name “firebase-adminsdk”, make sure it has at least the following roles:
        1. Firebase Admin SDK Administrator Service Agent
        2. Firebase Authentication Admin
        3. Service Account Token Creator
    3. Select one with name “App Engine default service account” make sure it has at least the following roles:
        1. Editor
        2. Service Account Token Creator
9. Set API key restrictions  [https://cloud.google.com/docs/authentication/api-keys#adding_application_restrictions](https://cloud.google.com/docs/authentication/api-keys#adding_application_restrictions)
    1. Open Google Cloud APIs and Services settings [https://console.developers.google.com/apis/credentials](https://console.developers.google.com/apis/credentials) and select the correct project
    2. Under “API Keys” select "Browser key (auto created by Firebase)”
    3. Set “Application restrictions” to be “HTTP referrers (web sites)”
    4. Whitelist domains under "Website restrictions”
    5. Under "API restrictions” select “Restrict key” and choose:
        1. Cloud Firestore API
        2. Identity Toolkit API
10. Enable IAM Service Account Credentials API
    1. Go to the following link and enable the API [https://console.developers.google.com/apis/api/iamcredentials.googleapis.com/overview](https://console.developers.google.com/apis/api/iamcredentials.googleapis.com/overview)
11. Add `FIREBASE_TOKEN` used to deploy firebase from CI to Github actions secrets
    1. On your local machine run `firebase login:ci` (make sure you have firebase-tools installed globally)
    2. Login in the browser and authenticate firebase 
    3. Copy token that was printed to the terminal
    4. !!!! IMPORTANT !!!! Scope the secret to the branch by which it should be used. For example if you are creating a Firebase project for staging, make sure that in the Github Actions you scope the token to be available only for the staging branch. Otherwise it might deploy firebase to wrong environment!!!!
        1. Go to Github actions settings page and add secret `FIREBASE_TOKEN` with value of the token copied from the terminal. Scope it properly.
12. Add `FIREBASE_FUNCTIONS_URL` to the Vercel Environment Variables
    
    Assign following URL to it:
    
    `https://${region}-${projectId}.cloudfunctions.net`
    
    If you are not sure if the URL is correct, after firebase deployment is triggered, whether locally by running `firebase deploy` or by Github Actions, you can see the URL in the console output:
    
    ```
    Function URL (${functionName}(us-central1)): 
    https://us-central1-${projectId}.cloudfunctions.net/${functionName}
    
    ```
    
    Omit the functionName (last part) and use 
    
    `https://us-central1-${projectId}.cloudfunctions.net`

## Git hooks
It's advised to use post-merge git hook which builds firebase functions for you,
so your local firebase emulators will have the latest functions after a pull/merge.
1. copy or symlink `post-merge` file into `.git/hooks`
2. make the file executable by running `chmod +x post-merge`

## Architecture
### Technical Description
The project framework is [Aurelia](https://aurelia.io).

It is written mostly in Typescript, HTML and SCSS, and is bundled using Webpack.

## Community
[Join our Discord](https://discord.gg/primedao) and ask how you can get involved with PrimeDAO
