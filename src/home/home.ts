import { DealService } from "services/DealService";
import { DateService } from "./../services/DateService";
import { autoinject, singleton } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./home.scss";
import { Deal } from "entities/Deal";

@singleton(false)
@autoinject
export class Home {

  public featuredDeals: Array<any> = null;
  public cardIndex: number;
  private _openDeals: Array<any> = null;
  private _runningDeals: Array<any> = null;

  constructor(
    private router: Router,
    private dealService: DealService,
    private dateService: DateService,
  ) {
  }

  attached(): void {
    this.dealService.getFeaturedDeals().then((deals) => {
      this.featuredDeals = [...deals];
      this._openDeals = [...this.featuredDeals];
    });


    // this._runningDeals = [...this.featuredDeals];
    this._runningDeals = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 1",
          partner: "DAO Partner 1",
        },
        type: "Joint Venture",
        title: "Proposal Title",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
        },
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 2 With a Looooong Name",
          partner: "DAO Partner 2",
        },
        type: "Joint Venture",
        title: "Proposal Title",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
        },
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15*1000*60*60*24,
      },

    ];

    // this.featuredDeals = [...this._openDeals];
    this.cardIndex = 0;
  }

  dealToggle(index = 0):void {
    switch (index) {
      case 0:
        this.featuredDeals = [...this._openDeals];
        break;
      case 1:
        this.featuredDeals = [...this._runningDeals];
        break;
      default:
        this.featuredDeals = [...this._openDeals];
    }
    this.cardIndex = index;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
