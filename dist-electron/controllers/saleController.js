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
exports.createSale = createSale;
exports.getSales = getSales;
exports.getSaleItems = getSaleItems;
exports.getSaleById = getSaleById;
const saleRepository = __importStar(require("../repositories/saleRepository"));
const partRepository = __importStar(require("../repositories/partRepository"));
function createSale(saleData, items) {
    // Basic validation
    if (!items || items.length === 0) {
        throw new Error("Keranjang belanja kosong");
    }
    // Verify stock
    for (const item of items) {
        const part = partRepository.getPartById(item.spare_part_id);
        if (!part) {
            throw new Error(`Sparepart ID ${item.spare_part_id} tidak ditemukan`);
        }
        if (part.stock < item.quantity) {
            throw new Error(`Stok tidak cukup untuk ${part.name}. Sisa stok: ${part.stock}`);
        }
    }
    // Generate invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    saleData.invoice_number = `INV-${dateStr}-${random}`;
    // Calculate total if not provided
    if (!saleData.total_amount) {
        let total = 0;
        for (const item of items) {
            total += item.price * item.quantity;
        }
        saleData.total_amount = total;
    }
    return saleRepository.createSale(saleData, items);
}
function getSales(startDate, endDate) {
    return saleRepository.getSales(startDate, endDate);
}
function getSaleItems(saleId) {
    return saleRepository.getSaleItems(saleId);
}
function getSaleById(saleId) {
    return saleRepository.getSaleById(saleId);
}
