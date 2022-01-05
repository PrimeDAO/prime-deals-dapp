found 13 vulnerabilities (2 low, 7 moderate, 4 high) in 712 scanned packages

found 5 vulnerabilities (1 low, 4 moderate) in 725 scanned packages


- Should error state of wallet, if you belong to a certain DAO
- DAO name, logo, basic fundamental things
  - other data , that pertains to DAO
    - list from DeepDAO (they have everything), but we want it lean
  - main fnality
    - facility all chain executrion
    - provide platform to negotiate
- Need deep dive, to make sure, that we have gone through everything with ppl who know stuff
-

# Reading
What's C gonna require from me:
- C obtains web3 provider (or it makes assumption how it is injected) (we don't rely on that)
- What C requires to read the Blockchain (may not need for working with IPFS)
-

# Writing
You
6:46 PM
wallet can contain multiple accounts
may need to work with multiple account ids
You
6:52 PM
DeepDAO: databased about DAOs, maintain it. Supposedely have an API
You
6:53 PM
? Why do we need a list of DAOs in the first place?
You
6:56 PM
Potentially, a service, can give us ability, where user can choose from a set of DAOs.
Then that returns the LOGO url
How to choose what's the set of allowed DAOs
In the end, just name and logo url




    /**
     * 1. Get readonly provider
     * 2. If need to proide an identity to C (like account)
     *   - sign transactions
     *   - user needs to be able to store data
     *      (may require change in the state of the transaction. Wallet provider is the signer)
     *   - access user specific data (stored on behalf of user)
     *   - 3box (check with them some kind of identity)
     *     - ancestor of C
     *   ^ - Don't know which use cases we need atm
     *
     * QA: should know most about of application
     */