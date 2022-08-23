### Note:
## `scheduledDeepDaoOrganizationListUpdate` FirestoreFunction
This function is responsible for importing a list of DAO's (Organizations) from DeepDAO API, and store it into the `deep-dao` collection as multiple document batches, containing a map
of up to 500 organizations.

To test with Firebase Emulator-

    Add an .env file to the FirebaseFunctions functions (see Notion)
      # DeepDAO
      DEEPDAO_API_KEY=
      DEEPDAO_API_URL=

    Uncomment the callDeepDaoAPI function in firebaseFunctions/src/index.ts in order to be able to invoke it later in the emulator (make sure to comment out again after deployment, so it is not pushed to production)

    Deploy the firebase function: npm run firebase-deploy-deepdao-function:default

    When done, invoke it from the browser: http://localhost:5001/prime-deals-6ace4/us-central1/callDeepDaoAPI
    This will create a new deep-dao collection in the emulator with filled with data.
    If running using Firebase cloud- the collection is already live.

    Run npm ci to install the new package cl-webcomp-poc.

