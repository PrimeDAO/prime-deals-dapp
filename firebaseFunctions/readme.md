### Note:
## `scheduledDeepDaoOrganizationListUpdate` FirestoreFunction
This function is responsible for importing a list of DAO's (Organizations) from DeepDAO API, and store it into the `deep-dao` collection as multiple document batches, containing a map
of up to 500 organizations.

In order for the FirestoreFunction to be able to run correctly, the credentials for DeepDAO API must be added in a `.env` file under `firebaseFunctions` root.

Please add the following variables before deploying the function:
(Specified in the 'Environment Variables' document)
```
# DeepDAO
DEEPDAO_API_KEY=
DEEPDAO_API_URL=
```
