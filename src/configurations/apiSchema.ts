/**
 * Schema on Notion:
 *   https://www.notion.so/primedao/PrimeDeals-Data-Module-Scheme-378f2f66edfe423f9660ba32a26e62ad
 */

export interface IPrimeDeals {
  Deals: IDeal[],
  Terms: ITerms
}

export interface IDeal {
  Proposal: {
    Title: string; // ( 50 ? )
    Summary: string; // ( 250 )
    Description: string; // ( 1000 )
  },
  Details: {
    ProposalLead: {
      Address: string; // ( hex )
      Email?: string;
    },
    DAOs: /* Array( */ {
      DaoName: string;
      TreasuryAddress: string;
      Tokens: /* Array( */{
        Name: string;
        Address: string;
        Amount: number
        InstantTransferAmount: 0,
        VestedAmount: 0,
        VestedPeriod: 0,
        CliffPeriod: 0,
      } /* ) */,
      Representative /* Object( name:value */ /*(max-5)*/: {
        "<Address>" /* UID */ : {
          Vote: 0, /* !!!!!!!!!!!!!!!!!!!!!!!! */
          Deposits: 0, /* !!!!!!!!!!!!!!!!!!!!!!!! */
          LastVisit?: 0, /* date (optional!!!)*/
        }
      }
    },
    SocialMedia: /* Array( */ {
      Name: string; //
      URL: string; //
    }
  }

}

export interface ITerms {
  Clauses: IClause[];
  PrivateDeal /* Boolean */: false;
  DealParameters: 0;
}

export interface IClause {
  description: string,
  discussionThread: {
    threadId: string,
    creator: string,
    createdAt: Date,
  }
}

export interface IWallet {
  Authorization: "Wallet Address",
  IsPrivate: false,
  IsOpenDeal: false,
  Status: "Count of votes",
}
