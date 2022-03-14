import { Address } from "./EthereumService";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { getDoc, collection, doc, query, where, getDocs, writeBatch, QuerySnapshot, DocumentData, Query, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { firebaseDatabase, FirebaseService } from "./FirebaseService";
import { v4 as uuidv4 } from "uuid";
import uniqBy from "lodash/uniqBy";
import { combineLatest, fromEventPattern, Observable, Subject } from "rxjs";
import { map, mergeAll } from "rxjs/operators";

export interface IFirebaseDocument {
  id: string;
  data: any;
}

const DEALS_COLLECTION = "deals";
const VOTES_COLLECTION = "votes";

const allPublicDealsQuery = query(collection(firebaseDatabase, DEALS_COLLECTION), where("registrationData.private", "==", false));

const representativeDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("representativesAddresses", "array-contains", address),
);

const proposalLeadDealsQuery = (address: Address) => query(
  collection(firebaseDatabase, DEALS_COLLECTION),
  where("registrationData.proposalLead.address", "==", address),
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
      const batch = writeBatch(firebaseDatabase);
      const representativesAddresses = [...registrationData.primaryDAO.representatives, ...registrationData.partnerDAO.representatives].map(item => item.address);

      const dealId = uuidv4();
      const dealRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
      batch.set(dealRef, {
        registrationData,
        representativesAddresses,
      });

      representativesAddresses.forEach(address => {
        const representativeRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId, VOTES_COLLECTION, address);
        batch.set(representativeRef, {vote: false});
      });

      await batch.commit();
    } catch {
      this.eventAggregator.publish("handleFailure", "There was an error while creating the Deal");
    }
  }

  public async updateTokenSwapRegistrationData(dealId: string, registrationData: IDealRegistrationTokenSwap) {
    const dealRef = doc(firebaseDatabase, DEALS_COLLECTION, dealId);
    setDoc(dealRef, { registrationData }, { merge: true });
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

  public subscribeToAllDealsForAddress(address: Address): Observable<Array<IFirebaseDocument>> {
    const allPublicDeals = this.getQueryObservable<Array<IFirebaseDocument>>(allPublicDealsQuery);
    const representativeDeals = this.getQueryObservable<Array<IFirebaseDocument>>(representativeDealsQuery(address));
    const proposalLeadDeals = this.getQueryObservable<Array<IFirebaseDocument>>(proposalLeadDealsQuery(address));

    return combineLatest([allPublicDeals, representativeDeals, proposalLeadDeals])
      .pipe(
        map(data => uniqBy(data.flat(), "id")),
      );
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
