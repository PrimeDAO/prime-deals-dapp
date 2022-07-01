import { AxiosService } from "services/axiosService";
import { Utils } from "services/utils";
import { inject } from "aurelia";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Query,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { FirebaseService } from "./FirebaseService";
import { firebaseAuth, firebaseDatabase } from "./firebase-helpers";
import { combineLatest, fromEventPattern, merge, Observable, Subject } from "rxjs";
import { map, mergeAll, skip } from "rxjs/operators";
import { DEALS_TOKEN_SWAP_COLLECTION, DEALS_TOKEN_SWAP_UPDATES_COLLECTION, IFirebaseDocument } from "./FirestoreTypes";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import axios from "axios";
import { IDealDiscussion } from "entities/DealDiscussions";
import { Hash } from "./EthereumService";

/**
 * TODO: Should define a new place for this type, and all other `Address` imports should take it from there
 * Cause for change: Want to import app code into Cypress code (, because we want to use the acutal code we are testing).
 * Reason: The other dependencies in `EthereumService` got pulled into Cypress webpack build as well.
 *   And the current Cypress webpack does not support, eg. scss files bundling and processing
 */
type Address = string;

const VOTES_COLLECTIONS = {
  PRIMARY_DAO: "primary-dao-votes",
  PARTNER_DAO: "partner-dao-votes",
};

@inject()
export class FirestoreService<
  TDealDocument extends IDealTokenSwapDocument,
  TRegistrationData extends IDealRegistrationTokenSwap> {

  public deals = [];

  constructor(
    private firebaseService: FirebaseService,
    private axiosService: AxiosService,
  ){}

  /**
   * Creates new Deal document with registrationData inside Firestore deals collection
   * @param registrationData TRegistrationData
   * @returns Promise<void>
   */
  public async createDealTokenSwap(registrationData: TRegistrationData): Promise<IDealTokenSwapDocument> {
    try {
      if (!firebaseAuth.currentUser) {
        // this check is just for the UI purposes, write access is handled by firestore.rules
        throw new Error("User not authenticated");
      }

      const idToken = await firebaseAuth.currentUser.getIdToken();

      const response = await axios.post(
        `${process.env.FIREBASE_FUNCTIONS_URL}/CI-createDeal`,
        {registrationData},
        {headers: {Authorization: `Bearer ${idToken}`}},
      );

      return response.data;
    } catch (error) {
      this.axiosService.axiosErrorHandler(error);
      throw new Error(error);
    }
  }

  /**
   * Updates Deal document with provided registration data
   * @param dealId string
   * @param registrationData TRegistrationData
   * @returns Promise<void>
   */
  public async updateTokenSwapRegistrationData(
    dealId: string,
    registrationData: TRegistrationData,
  ): Promise<void> {
    try {
      const dealRef = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
      await setDoc(dealRef, { registrationData }, { merge: true });
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Updates representative vote
   * @param dealId string
   * @param address string
   * @param dao "PRIMARY_DAO" | "PARTNER_DAO"
   * @param value boolean
   * @returns Promise<void>
   */
  public async updateRepresentativeVote(
    dealId: string,
    address: string,
    dao: "PRIMARY_DAO" | "PARTNER_DAO",
    value: boolean,
  ): Promise<void> {
    try {
      const voteRef = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId, VOTES_COLLECTIONS[dao], address);
      await setDoc(
        voteRef,
        {
          vote: value,
        },
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Reads deal by ID from Firestore
   *
   * @param dealId string
   * @returns Promise<TDealDocument>
   */
  public async getDealById<TDealDocument>(dealId: string): Promise<TDealDocument> {
    try {
      const docRef = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
      const docSnapshot = await getDoc(docRef);

      // Checks is the document exists
      // (docSnapshot could be returned with no data if the document has nested collections and no data)
      if (docSnapshot.exists()) {
        return docSnapshot.data() as TDealDocument;
      } else {
        return null;
      }
    } catch (_error) {
      return null; // exception is thrown when the deal is not found or inaccessible
    }
  }

  /**
   * Reads all public deals from Firestore
   *
   * @returns Promise<IFirebaseDocument<TDealDocument>[]>
   */
  public getAllPublicDeals<TDealDocument>(): Promise<Array<IFirebaseDocument<TDealDocument>>> {
    return this.getDealDocuments(this.allPublicDealsQuery());
  }

  /**
   * Reads all deals from Firestore where provided address is a representative.
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument<TDealDocument>[]>
   */
  public getRepresentativeDeals(address: Address): Promise<Array<IFirebaseDocument<TDealDocument>>> {
    return this.getDealDocuments(this.representativeDealsQuery(address));
  }

  /**
   * Reads all deals from Firestore where provided address is the Proposal Lead.
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument<TDealDocument>[]>
   */
  public getProposalLeadDeals(address: Address): Promise<Array<IFirebaseDocument<TDealDocument>>> {
    return this.getDealDocuments(this.proposalLeadDealsQuery(address));
  }

  /**
   * Reads all deals that are public, or provided address is a representative or the Proposal Lead
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument<TDealDocument>[]>
   */
  public async getAllDealsForTheUser<TDealDocument>(address: Address): Promise<Array<IFirebaseDocument<TDealDocument>>> {
    try {
      // Awaits all the queries to resolve
      const deals = await Promise.all([this.getAllPublicDeals(), this.getRepresentativeDeals(address), this.getProposalLeadDeals(address)]);

      // Flattens the returned data and removes duplicates
      return Utils.uniqById<IFirebaseDocument>(deals.flat());
    } catch (error) {
      throw new Error(`Error while getting deals ${error}`);
    }
  }

  /**
   * Observes all deals the are readable for the currently authenticated user
   *
   * That include all public deals and deals for which authenticated user is a representative or the Proposal Lead
   *
   * @returns Observable<IFirebaseDocument<TDealDocument>[]>
   */
  public subscribeToAllDealsForUser(): Observable<Array<IFirebaseDocument<TDealDocument>>> {
    // Observable of all public deals
    const allPublicDeals = this.getObservableOfQuery<Array<IFirebaseDocument>>(this.allPublicDealsQuery());

    // RxJS Subject used for combining multiple Firestore queries
    const queries: Subject<Observable<Array<IFirebaseDocument>>> = new Subject();

    // Subscribe to Firebase Authentication state change
    this.firebaseService.authStateChanged().subscribe(
      user => {
        if (!user) {
          // User is not authenticated with Firebase, therefore query only public deals
          queries.next(allPublicDeals);
        } else {
          // User is authenticated to Firebase, query public deals and deals where user is the proposalLead or a representative
          const representativeDeals = this.getObservableOfQuery<Array<IFirebaseDocument>>(this.representativeDealsQuery(user.uid));
          const proposalLeadDeals = this.getObservableOfQuery<Array<IFirebaseDocument>>(this.proposalLeadDealsQuery(user.uid));

          // emits new value of the combined Observables
          queries
            .next(
              // Combines latest value emitted by each Observable
              combineLatest([
                allPublicDeals,
                representativeDeals,
                proposalLeadDeals,
              ]).pipe(
                // Flattens the emitted data and removes duplicates
                map(data => Utils.uniqById<IFirebaseDocument>(data.flat())),
              ),
            );
        }
      },
    );

    // Turns Subject into an Observable
    const deals: Observable<Array<IFirebaseDocument>> = queries.pipe(
      mergeAll(),
    );

    return deals;
  }

  public allDealsForAddressObservable(accountAddress: string, skipFirst = false): Observable<Array<IDealTokenSwapDocument>> {
    const allPublicDeals = this.getObservableOfQueryUpdates<IDealTokenSwapDocument>(this.allPublicDealsQuery()).pipe(
      skip(skipFirst ? 1 : 0),
    );
    const representativeDeals = this.getObservableOfQueryUpdates<IDealTokenSwapDocument>(this.representativeDealsQuery(accountAddress)).pipe(
      skip(skipFirst ? 1 : 0),
    );
    const proposalLeadDeals = this.getObservableOfQueryUpdates<IDealTokenSwapDocument>(this.proposalLeadDealsQuery(accountAddress)).pipe(
      skip(skipFirst ? 1 : 0),
    );

    return merge(
      allPublicDeals,
      representativeDeals,
      proposalLeadDeals,
    );
  }

  /**
   * Observes all public deals in Firestore
   *
   * @returns Observable<IFirebaseDocument<TDealDocument>[]>
   */
  public allPublicDealsUpdatesObservable(): Observable<Array<IDealTokenSwapDocument>> {
    return this.getObservableOfQueryUpdates<IDealTokenSwapDocument>(this.allPublicDealsQuery());
  }

  public allDealsUpdatesObservable(): Observable<Array<{dealId: string, modifiedAt: string}>> {
    return this.getObservableOfQueryUpdates(this.allDealsUpdatesQuery());
  }

  /**
   * Sets deal isWithdrawn flag
   * @param dealId string
   * @param value boolean
   */
  public async updateDealIsWithdrawn(dealId: string, value: boolean): Promise<void> {
    try {
      const ref = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
      await setDoc(
        ref,
        {
          isWithdrawn: value,
        },
        {merge: true},
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Sets deal isPrivate flag
   */
  public async updateDealIsPrivate(dealId: string, value: boolean): Promise<void> {
    const ref = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
    await setDoc(
      ref,
      {
        registrationData: {
          isPrivate: value,
        },
      },
      {merge: true},
    );
  }

  /**
   * Sets deal isRejected flag
   * @param dealId string
   * @param value boolean
   */
  public async updateDealIsRejected(dealId: string, value: boolean): Promise<void> {
    try {
      const ref = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
      await setDoc(
        ref,
        {
          isRejected: value,
        },
        {merge: true},
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Sets deal swap transaction hash property
   * @param dealId string
   * @param value Hash
   */
  public async updateSwapTxHash(dealId: string, value: Hash): Promise<void> {
    try {
      const ref = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);
      await setDoc(
        ref,
        {
          swapTxHash: value,
        },
        {merge: true},
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Adds dealDiscussion to discussions map in a deal document
   * @param dealId string
   * @param discussion IDealDiscussion
   */
  public async addClauseDiscussion(dealId: string, discussionId: string, discussion: IDealDiscussion): Promise<void> {
    /**
     * Temporary solution: Schema for discussions is outdated (eg. has obsolete keys like `topic` or `id`).
     * This way, we ensure only the correct props are taken.
     */
    const finalDiscussions: IDealDiscussion = {
      version: discussion.version,
      createdAt: discussion.createdAt,
      modifiedAt: discussion.modifiedAt,
      createdBy: discussion.createdBy,
      replies: discussion.replies,
      publicReplies: discussion.publicReplies,
      key: discussion.key,
    };

    try {
      const ref = doc(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION, dealId);

      await setDoc(
        ref,
        {
          clauseDiscussions: {[discussionId]: finalDiscussions},
        },
        {merge: true},
      );
    } catch (error) {
      throw new Error(error);
    }

  }

  /**
   * Gets a RxJS Observable for Firestore Query.
   *
   * Turns Firestore onSnapshot method into Observable using RxJS fromEventPattern
   *
   * @param q Query<DocumentData>
   * @returns Observable
   */
  private getObservableOfQuery<T>(q: Query<DocumentData>): Observable<T> {
    return fromEventPattern(
      (handler) => onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          handler(this.getDealDocumentsFromQuerySnapshot(querySnapshot));
        },
      ),
      (handler, unsubscribe: Unsubscribe) => {
        unsubscribe();
      },
    );
  }

  /**
   * Turns Firestore QuerySnapshot into a collection
   *
   * @param querySnapshot QuerySnapshot<DocumentData>
   * @returns IFirebaseDocument[]
   */
  private getDealDocumentsFromQuerySnapshot<T>(querySnapshot: QuerySnapshot<DocumentData>): Array<IFirebaseDocument<T>> {
    return querySnapshot.docs
      // Filters out documents that don't exist
      // (doc could be returned with no data if the document has nested collections and no data)
      .filter(doc => doc.exists())
      .map(doc => ({
        id: doc.id,
        data: doc.data() as T,
      }));
  }

  /**
   * Reads documents from Firestore by provided query and formats them
   *
   * @param q Query
   * @returns Promise<IFirebaseDocument[]>
   */
  private async getDealDocuments<T>(q: Query<DocumentData>): Promise<Array<IFirebaseDocument<T>>> {
    const querySnapshot = await getDocs(q);

    return this.getDealDocumentsFromQuerySnapshot<T>(querySnapshot);
  }

  private allDealsUpdatesQuery(): Query<DocumentData> {
    return query(
      collection(firebaseDatabase, DEALS_TOKEN_SWAP_UPDATES_COLLECTION),
    );
  }

  private allPublicDealsQuery(): Query<DocumentData> {
    return query(
      collection(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION),
      where("registrationData.isPrivate", "==", false),
    );
  }

  private representativeDealsQuery(address: Address): Query<DocumentData>{
    return query(
      collection(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION),
      where("representativesAddresses", "array-contains", address),
    );
  }

  private proposalLeadDealsQuery(address: Address): Query<DocumentData> {
    return query(
      collection(firebaseDatabase, DEALS_TOKEN_SWAP_COLLECTION),
      where("registrationData.proposalLead.address", "==", address),
    );
  }

  private getObservableOfQueryUpdates<T>(q: Query<DocumentData>): Observable<Array<T>> {
    return fromEventPattern(
      (handler) => onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const updatedDocuments = [];
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
              updatedDocuments.push(change.doc.data());
            }
          });
          handler(updatedDocuments);
        },
      ),
      (handler, unsubscribe: Unsubscribe) => {
        unsubscribe();
      },
    );
  }
}
