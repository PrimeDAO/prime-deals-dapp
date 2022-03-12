export enum EventType {
  DealsLoading = "deals.loading",
  DealsCreating = "deal.creating",
  TransactionSent = "transaction.sent",
  TransactionConfirmed = "transaction.confirmed",
  TransactionFailed = "transaction.failed",
  TransactionSending = "transaction.sending",
  TransactionMined = "transaction.mined",
  AccountConnect = "Account.Connect",
  WrongNetwork = "Network.wrongNetwork",
  SecondPassed = "secondPassed",
  HandleFailure = "handleFailure",
  HandleSuccess = "handleSuccess",
  HandleTransaction = "handleTransaction",
  HandleMessage = "handleMessage",
  HandleException = "handleException",
  HandleWarning = "handleWarning",
  HandleInfo = "handleInfo",
  HandleValidationError = "handleValidationError",
  ShowMessage = "showMessage",
  ContractsChanged = "Contracts.Changed",
  NetworkNewBlock = "Network.NewBlock",
  NetworkChangedAccount = "Network.Changed.Account",
  NetworkChangedId = "Network.Changed.Id",
  NetworkChangedConnected = "Network.Changed.Connected",
  NetworkChangedDisconnect = "Network.Changed.Disconnect"
}

export enum Loggers {
  PrimeDeals = "Prime Deals"
}
