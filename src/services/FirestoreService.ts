import { Utils } from "services/utils";
import { Address } from "./EthereumService";
import { autoinject } from "aurelia-framework";
import { getDoc, collection, doc, query, where, getDocs, QuerySnapshot, DocumentData, Query, onSnapshot, Unsubscribe, setDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { firebaseAuth, firebaseDatabase, FirebaseService } from "./FirebaseService";
import { combineLatest, fromEventPattern, Observable, Subject } from "rxjs";
import { map, mergeAll } from "rxjs/operators";

export interface IFirebaseDocument {
  id: string;
  data: any;
}

const DEALS_COLLECTION = "deals";
const VOTES_COLLECTIONS = {
  PRIMARY_DAO: "primary-dao-votes",
  PARTNER_DAO: "partner-dao-votes",
};

const allPublicDealsQuery = query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("registrationData.isPrivate", "==", false),
  where("meta.isReady", "==", true),
);

const representativeDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("meta.representativesAddresses", "array-contains", address),
  where("meta.isReady", "==", true),
);

const proposalLeadDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("registrationData.proposalLead.address", "==", address),
  where("meta.isReady", "==", true),
);

@autoinject
export class FirestoreService {
  public deals = [];

  constructor(
    private firebaseService: FirebaseService,
  ){}

  /**
   * Creates new Deal document with registrationData inside Firestore deals collection
   * @param registrationData IDealRegistrationTokenSwap
   * @returns Promise<void>
   */
  public async createTokenSwapDeal(registrationData: IDealRegistrationTokenSwap) {
    try {
      if (!firebaseAuth.currentUser.uid) {
        // this check is just for the UI purposes, write access is handled by firestore.rules
        throw new Error("User not authenticated");
      }

      const dealData: {registrationData: IDealRegistrationTokenSwap, meta: { isReady:boolean }} = {
        registrationData: {
          ...JSON.parse(JSON.stringify(registrationData)),
          createdAt: serverTimestamp(),
          createdByAddress: firebaseAuth.currentUser.uid,
        },
        meta: {
          isReady: false,
        },
      };

      await addDoc(collection(firebaseDatabase, DEALS_COLLECTION), dealData);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Updates Deal document with provided registration data
   * @param dealId string
   * @param registrationData IDealRegistrationTokenSwap
   * @returns Promise<void>
   */
  public async updateTokenSwapRegistrationData(
    dealId: string,
    registrationData: IDealRegistrationTokenSwap,
  ): Promise<void> {
    try {
      const dealRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
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
      const voteRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId, VOTES_COLLECTIONS[dao], address);
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
   * @returns Promise<IFirebaseDocument>
   */
  public async getDealById(dealId: string): Promise<IFirebaseDocument> {
    try {
      const docRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return {
          data: docSnapshot.data(),
          id: docSnapshot.id,
        };
      } else {
        throw new Error("Deal does not exist");
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Reads all public deals from Firestore
   *
   * @returns Promise<IFirebaseDocument[]>
   */
  public async getAllPublicDeals(): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(allPublicDealsQuery);
  }

  /**
   * Reads all deals from Firestore where provided address is a representative.
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument[]>
   */
  public async getRepresentativeDeals(address: Address): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(representativeDealsQuery(address));
  }

  /**
   * Reads all deals from Firestore where provided address is the Proposal Lead.
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument[]>
   */
  public async getProposalLeadDeals(address: Address): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(proposalLeadDealsQuery(address));
  }

  /**
   * Reads all deals that are public, or provided address is a representative or the Proposal Lead
   *
   * NOTE: provided address needs to be authenticated to Firebase to read private deals
   *
   * @param address string
   * @returns Promise<IFirebaseDocument[]>
   */
  public async getAllDealsForTheUser(address: Address): Promise<Array<IFirebaseDocument>> {
    try {
      const deals = await Promise.all([this.getAllPublicDeals(), this.getRepresentativeDeals(address), this.getProposalLeadDeals(address)]);
      return Utils.uniqById<IFirebaseDocument>(deals.flat());
    } catch {
      throw new Error("Error while getting deals");
    }
  }

  /**
   * Observes all deals the are readable for the currently authenticated user
   *
   * That include all public deals and deals for which authenticated user is a representative or the Proposal Lead
   *
   * @returns Observable<IFirebaseDocument[]>
   */
  public subscribeToAllDealsForUser(): Observable<Array<IFirebaseDocument>> {
    const allPublicDeals = this.getQueryObservable<Array<IFirebaseDocument>>(allPublicDealsQuery);

    const queries$$: Subject<Observable<Array<IFirebaseDocument>>> = new Subject();

    this.firebaseService.authStateChanged().subscribe(
      user => {
        if (!user) {
          queries$$.next(allPublicDeals);
        } else {
          const representativeDeals = this.getQueryObservable<Array<IFirebaseDocument>>(representativeDealsQuery(user.uid));
          const proposalLeadDeals = this.getQueryObservable<Array<IFirebaseDocument>>(proposalLeadDealsQuery(user.uid));
          queries$$.next(combineLatest([
            allPublicDeals,
            representativeDeals,
            proposalLeadDeals,
          ]).pipe(
            map(data => Utils.uniqById<IFirebaseDocument>(data.flat())),
          ));
        }
      },
    );

    const queries$: Observable<Array<IFirebaseDocument>> = queries$$.pipe(
      mergeAll(),
    );

    return queries$;
  }

  /**
   * Observes all public deals in Firestore
   *
   * @returns Observable<IFirebaseDocument[]>
   */
  public subscribeToAllPublicDeals(): Observable<Array<IFirebaseDocument>> {
    return this.getQueryObservable<Array<IFirebaseDocument>>(allPublicDealsQuery);
  }

  /**
   * Adds deal clause -> discussion to Firestore discussions map
   *
   * @param dealId string
   * @param clauseId string
   * @param discussionHash string
   * @returns Promise<void>
   */
  public async addClauseDiscussion(dealId: string, clauseId: string, discussionHash: string) {
    try {
      const ref = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
      await setDoc(
        ref,
        {
          discussions: {[clauseId]: discussionHash},
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
  private getQueryObservable<T>(q: Query<DocumentData>): Observable<T> {
    return fromEventPattern(
      (handler) => onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          handler(this.getDocumentsFromQuerySnapshot(querySnapshot));
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
  private getDocumentsFromQuerySnapshot(querySnapshot: QuerySnapshot<DocumentData>): Array<IFirebaseDocument> {
    return querySnapshot.docs.filter(doc => doc.exists()).map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));
  }

  /**
   * Reads documents from Firestore by provided query and formats them
   *
   * @param q Query
   * @returns Promise<IFirebaseDocument[]>
   */
  private async getDocuments(q: Query<DocumentData>): Promise<Array<IFirebaseDocument>> {
    const querySnapshot = await getDocs(q);

    return this.getDocumentsFromQuerySnapshot(querySnapshot);
  }
}
