import {DealService} from "services/DealService";
import {autoinject, singleton} from "aurelia-framework";
import {Router} from "aurelia-router";
import "./home.scss";
import {IDummyDeal} from "../entities/IDummyDeal";

@singleton(false)
@autoinject
export class Home {
  cardIndex = 0;

  featuredDeals: Array<any> = [];
  allDeals: Record<"open" | "partnered", Array<IDummyDeal>> = {
    open: [],
    partnered: [],
  };

  constructor(
    private router: Router,
    private dealService: DealService,
  ) {
  }

  attached(): void {
    // TODO: use dealService when available instead of dummy data.
    // this.dealService.getFeaturedDeals().then((deals) => {
    //   this.featuredDeals = [...deals];
    //   this.openDeals = [...this.featuredDeals];
    // });

    this.allDeals.open = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 2 With a Looooong Name",
        },
        type: "Token Swap",
        title: "Swap tokenized carbon credits for a better world",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        status: "contributingIsOpen",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 1",
        },
        type: "Joint Venture",
        title: "Let’s spice up the world together",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        status: "hasNotStarted",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 2 With a Looooong Name",
        },
        type: "Token Swap",
        title: "Proposal Title",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        },
        status: "claimingIsOpen",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
    ];
    this.allDeals.partnered = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 1",
          partner: "DAO Partner 1",
        },
        type: "Joint Venture",
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
        },
        status: "incomplete",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        dao: {
          creator: "DAO Creator 2 With a Looooong Name",
          partner: "DAO Partner 2",
        },
        type: "Token Swap",
        title: "Proposal Title",
        description: "Lorem ipsum dolor sit amet, consectetur adi piscing elit. Ut pretium pretium tempor. Uteget imperdiet neque. In volutpat ante semper diam molestie.",
        logo: {
          creator: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
          partner: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
        },
        status: "uninitialized",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
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
        status: "isClosed",
        startsInMilliseconds: new Date().getUTCMilliseconds() + 0.15 * 1000 * 60 * 60 * 24,
      },
    ];

    this.featuredDeals = this.allDeals.open;

    this.cardIndex = 0;
  }

  dealToggle(index: number, type: "open" | "partnered"): void {
    this.featuredDeals = this.allDeals[type];
    this.cardIndex = index;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
