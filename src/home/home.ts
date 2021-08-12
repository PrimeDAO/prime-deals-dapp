// import { SeedService } from "services/SeedService";
import { DateService } from "./../services/DateService";
import { autoinject, singleton } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./home.scss";
// import { Seed } from "entities/Seed";

@singleton(false)
@autoinject
export class Home {

  public featuredDeals: Array<any> = null;
  public cardIndex: number;
  private _openDeals: Array<any> = null;
  private _runningDeals: Array<any> = null;

  constructor(
    private router: Router,
    // private seedService: SeedService,
    private dateService: DateService,

  ) {
  }

  attached(): void {
    // this.seedService.getFeaturedSeeds().then((seeds) => {
    //   this.featuredSeeds = seeds;
    // });
    this._openDeals = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "PrimeDAO",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Uniswap",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
        },
        canGoToDashboard: false,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 1*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Compound",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 2.25*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Fei",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/fei.png",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 5*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 5",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 15*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 6",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.5*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 7",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 2*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 8",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.85*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 9",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: false,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 5*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: "Open DAO 10",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 1*1000*60*60*24,
      },
    ];

    this._runningDeals = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 1",
          partner: "DAO Partner 1",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
        },
        canGoToDashboard: true,
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        contributingIsOpen: false,
        uninitialized: false,
        hasNotStarted: true,
        hideIcons: false,
        isPaused: false,
        isClosed: false,
        claimingIsOpen: false,
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15*1000*60*60*24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 2",
          partner: "DAO Partner 2",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 3",
          partner: "DAO Partner 3",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/fei.png",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 4",
          partner: "DAO Partner 4",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 5",
          partner: "DAO Partner 5",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 6",
          partner: "DAO Partner 6",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 7",
          partner: "DAO Partner 7",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 8",
          partner: "DAO Partner 8",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 9",
          partner: "DAO Partner 9",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 10",
          partner: "DAO Partner  10",
        },
        proposal: {
          title: "Proposal Title",
          description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        },
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        canGoToDashboard: true,
      },
    ];

    this.featuredDeals = [...this._openDeals];
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
