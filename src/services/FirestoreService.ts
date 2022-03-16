import { Address } from "./EthereumService";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { getDoc, collection, doc, query, where, getDocs, QuerySnapshot, DocumentData, Query, onSnapshot, Unsubscribe, setDoc, serverTimestamp, addDoc, arrayUnion } from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { firebaseAuth, firebaseDatabase, FirebaseService } from "./FirebaseService";
import uniqBy from "lodash/uniqBy";
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

const allPublicDealsQuery = query(collection(firebaseDatabase, DEALS_COLLECTION), where("registrationData.isPrivate", "==", false), where("isReady", "==", true));

const representativeDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("representativesAddresses", "array-contains", address),
  where("isReady", "==", true),
);

const proposalLeadDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("registrationData.proposalLead.address", "==", address),
  where("isReady", "==", true),
);

@autoinject
export class FirestoreService {
  public deals = [];

  constructor(
    private eventAggregator: EventAggregator,
    private firebaseService: FirebaseService,
  ){}

  public async createTokenSwapDeal(registrationData: IDealRegistrationTokenSwap) {
    try {
      if (!firebaseAuth.currentUser.uid) {
        // this check is just for the UI purposes, write access is handled by firestore.rules
        throw new Error("User not authenticated");
      }

      const dealData: {registrationData: IDealRegistrationTokenSwap, isReady:boolean} = {
        registrationData: {
          ...JSON.parse(JSON.stringify(registrationData)),
          createdAt: serverTimestamp(),
          createdByAddress: firebaseAuth.currentUser.uid,
        },
        isReady: false,
      };

      await addDoc(collection(firebaseDatabase, DEALS_COLLECTION), dealData);
    } catch (error) {
      this.eventAggregator.publish("handleFailure", `There was an error while creating the Deal: ${error}`);
    }
  }

  public async updateTokenSwapRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    const dealRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
    setDoc(dealRef, { registrationData }, { merge: true });
  }

  public async updateRepresentativeVote(
    dealId: string,
    address: string,
    dao: "PRIMARY_DAO" | "PARTNER_DAO",
    value: any,
  ) {
    const voteRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId, VOTES_COLLECTIONS[dao], address);
    setDoc(
      voteRef,
      {
        vote: value,
      },
    );
  }

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

  public async getAllPublicDeals(): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(allPublicDealsQuery);
  }

  public async getRepresentativeDeals(address: Address): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(representativeDealsQuery(address));
  }

  public async getProposalLeadDeals(address: Address): Promise<Array<IFirebaseDocument>> {
    return await this.getDocuments(proposalLeadDealsQuery(address));
  }

  public async getAllDealsForTheUser(address: Address): Promise<Array<IFirebaseDocument>> {
    try {
      const deals = await Promise.all([this.getAllPublicDeals(), this.getRepresentativeDeals(address), this.getProposalLeadDeals(address)]);
      return uniqBy(deals.flat(), "id");
    } catch {
      throw new Error("Error while getting deals");
    }
  }

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
            map(data => uniqBy(data.flat(), "id")),
          ));
        }
      },
    );

    const queries$: Observable<Array<IFirebaseDocument>> = queries$$.pipe(
      mergeAll(),
    );

    return queries$;
  }

  public subscribeToAllPublicDeals(): Observable<Array<IFirebaseDocument>> {
    return this.getQueryObservable<Array<IFirebaseDocument>>(allPublicDealsQuery);
  }

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

  private getDocumentsFromQuerySnapshot(querySnapshot: QuerySnapshot<DocumentData>): Array<IFirebaseDocument> {
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));
  }

  private async getDocuments(q: Query<DocumentData>) {
    const querySnapshot = await getDocs(q);

    return this.getDocumentsFromQuerySnapshot(querySnapshot);
  }
}
