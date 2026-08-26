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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const saleController = __importStar(require("../../controllers/saleController"));
const electron_log_1 = __importDefault(require("electron-log"));
const validators_1 = require("../../src/utils/validators");
function registerSaleIpc(mainWindow) {
    electron_1.ipcMain.handle('create-sale', (event, saleData, items) => {
        try {
            const validSaleData = (0, validators_1.validateData)(validators_1.SaleSchema, saleData);
            const validItems = items.map(item => (0, validators_1.validateData)(validators_1.SaleItemSchema, item));
            const saleId = saleController.createSale(validSaleData, validItems);
            return { success: true, saleId };
        }
        catch (error) {
            electron_log_1.default.error('Error in createSale:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('get-sales', (event, startDate, endDate) => {
        try {
            return saleController.getSales(startDate, endDate);
        }
        catch (error) {
            electron_log_1.default.error('Error in getSales:', error);
            return [];
        }
    });
    electron_1.ipcMain.handle('get-sale-items', (event, saleId) => {
        try {
            return saleController.getSaleItems(saleId);
        }
        catch (error) {
            electron_log_1.default.error('Error in getSaleItems:', error);
            return [];
        }
    });
    electron_1.ipcMain.handle('get-sale', (event, saleId) => {
        try {
            return saleController.getSaleById(saleId);
        }
        catch (error) {
            electron_log_1.default.error('Error in getSale:', error);
            return null;
        }
    });
}
exports.default = registerSaleIpc;
