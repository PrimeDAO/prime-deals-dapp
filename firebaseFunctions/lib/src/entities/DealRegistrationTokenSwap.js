"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRegistrationTokenSwap = exports.emptyDaoDetails = exports.Platforms = void 0;
var Platforms;
(function (Platforms) {
    Platforms[Platforms["Independent"] = 0] = "Independent";
    Platforms[Platforms["DAOstack"] = 1] = "DAOstack";
    Platforms[Platforms["Moloch"] = 2] = "Moloch";
    Platforms[Platforms["OpenLaw"] = 3] = "OpenLaw";
    Platforms[Platforms["Aragon"] = 4] = "Aragon";
    Platforms[Platforms["Colony"] = 5] = "Colony";
    Platforms[Platforms["Compound Governance"] = 6] = "Compound Governance";
    Platforms[Platforms["Snapshot"] = 7] = "Snapshot";
    Platforms[Platforms["Gnosis Safe / Snapshot"] = 8] = "Gnosis Safe / Snapshot";
    Platforms[Platforms["Substrate"] = 9] = "Substrate";
})(Platforms = exports.Platforms || (exports.Platforms = {}));
function emptyDaoDetails() {
    return {
        name: "",
        tokens: [],
        treasury_address: "",
        representatives: [{ address: "" }],
        social_medias: [],
        logoURI: null,
    };
}
exports.emptyDaoDetails = emptyDaoDetails;
class DealRegistrationTokenSwap {
    constructor(isPartneredDeal = false) {
        this.clearState(isPartneredDeal);
    }
    clearState(isPartneredDeal) {
        this.version = "0.0.2";
        this.proposal = {
            title: "",
            summary: "",
            description: "",
        };
        this.primaryDAO = emptyDaoDetails();
        this.proposalLead = {
            address: "",
            email: "",
        };
        this.terms = {
            clauses: [{
                    id: "",
                    text: "",
                }],
        };
        this.keepAdminRights = true;
        this.offersPrivate = false;
        this.isPrivate = false;
        if (isPartneredDeal) {
            this.partnerDAO = emptyDaoDetails();
        }
        this.fundingPeriod = null;
        this.dealType = "token-swap";
    }
}
exports.DealRegistrationTokenSwap = DealRegistrationTokenSwap;
//# sourceMappingURL=DealRegistrationTokenSwap.js.map