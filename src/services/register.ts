import { AlertService } from "./AlertService";
import { FirestoreService } from "./FirestoreService";
import { FirebaseService } from "services/FirebaseService";
import { IContainer, IRegistry, Registration } from "aurelia";
import DOMPurify from "dompurify";
import { EthereumService, IEthereumService } from "./EthereumService";
import { FirestoreDealsService } from "./FirestoreDealsService";
import { IDataSourceDeals } from "./DataSourceDealsTypes";
// import { ConsoleLogService } from "services/ConsoleLogService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DiscussionsStreamService } from "dealDashboard/discussionsStreamService";
import {
  AureliaHelperService,
  AxiosService,
  BrowserStorageService,
  ConsoleLogService,
  ContractsService,
  DateService,
  DealService,
  DialogService,
  DisclaimerService,
  EnsService,
  IpfsService,
  NumberService,
  PinataIpfsClient,
  TokenListService,
  TokenMetadataService,
  TokenService,
  TransactionsService,
} from "services";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { ValidationService } from "./ValidationService";

export const register: IRegistry = {
  register: (container: IContainer) => {
    /* logging should be done first */
    // container.get(ConsoleLogService);
    container.register(Registration.singleton(IEthereumService, EthereumService));
    container.register(Registration.singleton(IDataSourceDeals, FirestoreDealsService));
    container.register(Registration.singleton(DOMPurify, DOMPurify));
    container.register(Registration.transient(DealTokenSwap, DealTokenSwap));
    container.register(Registration.singleton(DealService, DealService));
    container.register(Registration.singleton(ConsoleLogService, ConsoleLogService));
    container.register(Registration.singleton(BrowserStorageService, BrowserStorageService));
    container.register(Registration.singleton(DiscussionsService, DiscussionsService));
    container.register(Registration.singleton(DiscussionsStreamService, DiscussionsStreamService));
    container.register(Registration.singleton(DateService, DateService));
    container.register(Registration.singleton(ContractsService, ContractsService));
    container.register(Registration.singleton(AureliaHelperService, AureliaHelperService));
    container.register(Registration.singleton(DialogService, DialogService));
    container.register(Registration.singleton(TokenListService, TokenListService));
    container.register(Registration.singleton(TokenMetadataService, TokenMetadataService));
    container.register(Registration.singleton(TokenService, TokenService));
    container.register(Registration.singleton(IpfsService, IpfsService));
    container.register(Registration.singleton(NumberService, NumberService));
    container.register(Registration.singleton(TransactionsService, TransactionsService));
    container.register(Registration.singleton(DisclaimerService, DisclaimerService));
    container.register(Registration.singleton(FirebaseService, FirebaseService));
    container.register(Registration.singleton(FirestoreService, FirestoreService));
    container.register(Registration.singleton(EnsService, EnsService));
    container.register(Registration.singleton(AxiosService, AxiosService));
    container.register(Registration.singleton(AlertService, AlertService));
    container.register(Registration.singleton(PinataIpfsClient, PinataIpfsClient));
    container.register(Registration.singleton(ValidationService, ValidationService));

    return container;
  },
};
