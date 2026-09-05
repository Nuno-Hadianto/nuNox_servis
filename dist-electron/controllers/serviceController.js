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
exports.getServices = getServices;
exports.getServiceById = getServiceById;
exports.getServiceByTicketNumber = getServiceByTicketNumber;
exports.getServiceStatusHistory = getServiceStatusHistory;
exports.addService = addService;
exports.updateServiceStatus = updateServiceStatus;
exports.updateServiceDetails = updateServiceDetails;
exports.deleteService = deleteService;
exports.checkWarranty = checkWarranty;
const serviceRepository = __importStar(require("../repositories/serviceRepository"));
const validators_1 = require("../src/utils/validators");
function getServices(searchQuery = '', page = 1, limit = 50, technicianFilter) {
    return serviceRepository.getServices(searchQuery, page, limit, technicianFilter);
}
function getServiceById(id) {
    return serviceRepository.getServiceById(id);
}
function getServiceByTicketNumber(ticketNumber) {
    return serviceRepository.getServiceByTicketNumber(ticketNumber);
}
function getServiceStatusHistory(serviceOrderId) {
    return serviceRepository.getServiceStatusHistory(serviceOrderId);
}
function addService(data) {
    const validData = (0, validators_1.validateData)(validators_1.ServiceOrderSchema, data);
    return serviceRepository.addService(validData);
}
function updateServiceStatus(id, status, notes, warrantyDays = 0) {
    return serviceRepository.updateServiceStatus(id, status, notes, warrantyDays);
}
function updateServiceDetails(id, data) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = (0, validators_1.validateData)(validators_1.ServiceOrderSchema.partial(), data);
    return serviceRepository.updateServiceDetails(id, validData);
}
function deleteService(id) {
    return serviceRepository.deleteService(id);
}
function checkWarranty(deviceId) {
    return serviceRepository.checkWarranty(deviceId);
}
