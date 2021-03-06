import { FrameworkConfiguration } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("./elements/popupNotifications/popupNotifications"),
    PLATFORM.moduleName("./elements/EtherscanLink/EtherscanLink"),
    PLATFORM.moduleName("./elements/EthBalance/EthBalance"),
    PLATFORM.moduleName("./elements/address-link/address-link"),
    PLATFORM.moduleName("./elements/etherscan-button/etherscan-button"),
    PLATFORM.moduleName("./elements/UsersAddress/UsersAddress"),
    PLATFORM.moduleName("./elements/TokenBalance/TokenBalance"),
    PLATFORM.moduleName("./elements/dao-icon-name/dao-icon-name"),
    PLATFORM.moduleName("./elements/copyToClipboardButton/copyToClipboardButton"),
    PLATFORM.moduleName("./elements/numericInput/numericInput"),
    PLATFORM.moduleName("./elements/formattedNumber/formattedNumber"),
    PLATFORM.moduleName("./elements/ConnectButton/ConnectButton"),
    PLATFORM.moduleName("./elements/NetworkFeedback/NetworkFeedback"),
    PLATFORM.moduleName("./elements/modalscreen/modalscreen"),
    PLATFORM.moduleName("./elements/loading-dots/loading-dots"),
    PLATFORM.moduleName("./elements/inline-svg"),
    PLATFORM.moduleName("./elements/horizontal-scroller/horizontal-scroller"),
    PLATFORM.moduleName("./elements/tokenPair/tokenPair"),
    PLATFORM.moduleName("./elements/markdown/markdown"),
    PLATFORM.moduleName("./elements/formAddressInput/formAddressInput"),
    PLATFORM.moduleName("../dealDashboard/deal-swap-modal/deal-swap-modal"), //needed globally because it's being passed as a message to the ppopup-modal component
    PLATFORM.moduleName("./value-converters/number"),
    PLATFORM.moduleName("./value-converters/ethwei"),
    PLATFORM.moduleName("./value-converters/date"),
    PLATFORM.moduleName("./value-converters/dateDiff"),
    PLATFORM.moduleName("./value-converters/timespan"),
    PLATFORM.moduleName("./value-converters/boolean"),
    PLATFORM.moduleName("./value-converters/secondsDays"),
    PLATFORM.moduleName("./value-converters/smallHexString"),
    PLATFORM.moduleName("./value-converters/sort"),
    PLATFORM.moduleName("./value-converters/withCommas"),
    PLATFORM.moduleName("./value-converters/currency"),
    PLATFORM.moduleName("./value-converters/checksumAddress"),
    PLATFORM.moduleName("./value-converters/defined"),
    PLATFORM.moduleName("./dialogs/disclaimer/disclaimer"),
    PLATFORM.moduleName("./binding-behaviors/addressToEns"),
  ]);
}
