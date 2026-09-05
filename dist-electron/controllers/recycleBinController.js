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
const recycleBinRepository = __importStar(require("../repositories/recycleBinRepository"));
class RecycleBinController {
    getDeletedItems() {
        try {
            return { success: true, data: recycleBinRepository.getDeletedItems() };
        }
        catch (error) {
            console.error('Error in getDeletedItems:', error);
            return { success: false, error: 'Failed to fetch deleted items' };
        }
    }
    restoreItem(id, type) {
        try {
            recycleBinRepository.restoreItem(id, type);
            return { success: true, message: 'Item restored successfully' };
        }
        catch (error) {
            console.error('Error in restoreItem:', error);
            return { success: false, error: 'Failed to restore item' };
        }
    }
    hardDeleteItem(id, type) {
        try {
            recycleBinRepository.hardDeleteItem(id, type);
            return { success: true, message: 'Item deleted permanently' };
        }
        catch (error) {
            console.error('Error in hardDeleteItem:', error);
            return { success: false, error: 'Failed to delete item permanently' };
        }
    }
}
exports.default = new RecycleBinController();
