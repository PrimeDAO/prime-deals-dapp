// import { SeedService } from "services/SeedService";
import { DateService } from "./../services/DateService";
import { autoinject, singleton } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./home.scss";
// import { Seed } from "entities/Seed";

@singleton(false)
@autoinject
export class Home {

  featuredSeeds: Array<any> = null;
  runningSeeds: Array<any> = null;

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
    this.featuredSeeds = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "PrimeDAO",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Uniswap",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/uniswap.png",
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
        name: "Compound",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/compound.png",
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
        name: "Fei",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/fei.png",
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
        name: "Open DAO 5",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Open DAO 6",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Open DAO 7",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Open DAO 8",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Open DAO 9",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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
        name: "Open DAO 10",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
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

    this.runningSeeds = [
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 1",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 2",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 3",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 4",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 5",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 6",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 7",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 8",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 9",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
      {
        address: "0x1jk3lk4353l45kj345l3k45j345",
        name: "Running DAO 10",
        logo: "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/primedao.jpg",
        canGoToDashboard: true,
      },
    ];
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
