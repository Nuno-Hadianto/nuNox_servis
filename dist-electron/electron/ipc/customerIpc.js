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
exports.registerCustomerIpc = registerCustomerIpc;
const electron_1 = require("electron");
const customerController = __importStar(require("../../controllers/customerController"));
const validators_1 = require("../../src/utils/validators");
function registerCustomerIpc() {
    electron_1.ipcMain.handle('get-customers', (event, searchQuery, page, limit, sortBy = 'name_asc') => customerController.getCustomers(searchQuery, page, limit, sortBy));
    electron_1.ipcMain.handle('get-customer', (event, id) => customerController.getCustomerById(id));
    electron_1.ipcMain.handle('add-customer', (event, data) => {
        const validData = (0, validators_1.validateData)(validators_1.CustomerSchema, data);
        return customerController.addCustomer(validData);
    });
    electron_1.ipcMain.handle('update-customer', (event, id, data) => {
        const validData = (0, validators_1.validateData)(validators_1.CustomerSchema.partial(), data);
        return customerController.updateCustomer(id, validData);
    });
    electron_1.ipcMain.handle('delete-customer', (event, id) => customerController.deleteCustomer(id));
}
