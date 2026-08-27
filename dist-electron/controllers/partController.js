"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParts = getParts;
exports.getPartById = getPartById;
exports.addPart = addPart;
exports.updatePart = updatePart;
exports.updatePartStock = updatePartStock;
exports.deletePart = deletePart;
exports.importParts = importParts;
exports.getLowStockParts = getLowStockParts;
exports.getPartLogs = getPartLogs;
const partRepository = __importStar(require("../repositories/partRepository"));
const validators_1 = require("../src/utils/validators");
function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}
function getPartById(id) {
    return partRepository.getPartById(id);
}
function addPart(data) {
    const validData = (0, validators_1.validateData)(validators_1.SparepartSchema, data);
    return partRepository.addPart(validData);
}
function updatePart(id, data) {
    const validData = (0, validators_1.validateData)(validators_1.SparepartSchema, data);
    return partRepository.updatePart(id, validData);
}
function updatePartStock(id, change, reason, ref_id) {
    return partRepository.updatePartStock(id, change, reason, ref_id);
}
function getPartLogs(partId) {
    return partRepository.getPartLogs(partId);
}
function deletePart(id) {
    const hasServiceItems = partRepository.checkPartHasServiceItems(id);
    if (hasServiceItems) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    return partRepository.deletePart(id);
}
function importParts(dataArray) {
    return partRepository.importParts(dataArray);
}
function getLowStockParts(threshold) {
    return partRepository.getLowStockParts(threshold);
}
