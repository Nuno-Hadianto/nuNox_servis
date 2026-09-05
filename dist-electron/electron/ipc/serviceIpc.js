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
exports.registerServiceIpc = registerServiceIpc;
const electron_1 = require("electron");
const serviceController = __importStar(require("../../controllers/serviceController"));
const serviceItemController = __importStar(require("../../controllers/serviceItemController"));
const validators_1 = require("../../src/utils/validators");
function registerServiceIpc() {
    electron_1.ipcMain.handle('get-services', (event, searchQuery, page, limit, technicianFilter, sortBy = 'name_asc') => serviceController.getServices(searchQuery, page, limit, technicianFilter, sortBy));
    electron_1.ipcMain.handle('get-service', (event, id) => serviceController.getServiceById(id));
    electron_1.ipcMain.handle('get-service-by-ticket', (event, ticketNumber) => serviceController.getServiceByTicketNumber(ticketNumber));
    electron_1.ipcMain.handle('get-service-history', (event, id) => serviceController.getServiceStatusHistory(id));
    electron_1.ipcMain.handle('add-service', (event, data) => {
        const validData = (0, validators_1.validateData)(validators_1.ServiceOrderSchema, data);
        return serviceController.addService(validData);
    });
    electron_1.ipcMain.handle('update-service-status', (event, id, status, notes, warrantyDays = 0) => serviceController.updateServiceStatus(id, status, notes, warrantyDays));
    electron_1.ipcMain.handle('update-service-details', (event, id, data) => {
        const validData = (0, validators_1.validateData)(validators_1.ServiceOrderSchema.partial(), data);
        return serviceController.updateServiceDetails(id, validData);
    });
    electron_1.ipcMain.handle('delete-service', (event, id) => serviceController.deleteService(id));
    // Service Items
    electron_1.ipcMain.handle('get-service-items', (event, serviceId) => serviceItemController.getServiceItems(serviceId));
    electron_1.ipcMain.handle('add-service-item', (event, data) => {
        const validData = (0, validators_1.validateData)(validators_1.ServiceItemSchema, data);
        return serviceItemController.addServiceItem(validData);
    });
    electron_1.ipcMain.handle('delete-service-item', (event, id) => serviceItemController.deleteServiceItem(id));
    // Warranty
    electron_1.ipcMain.handle('check-warranty', (event, deviceId) => serviceController.checkWarranty(deviceId));
}
