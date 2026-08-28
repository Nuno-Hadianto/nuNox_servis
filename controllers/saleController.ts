export {};
import type { Sale, SaleItem } from '../shared/types';
import * as saleRepository from '../repositories/saleRepository';
import * as partRepository from '../repositories/partRepository';

function createSale(saleData: Omit<Sale, 'id'>, items: Omit<SaleItem, 'id'>[]) {
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

    type RepositorySaleData = { invoice_number: string; customer_name?: string; total_amount: number; payment_method: string; };
    return saleRepository.createSale(saleData as unknown as RepositorySaleData, items as unknown as SaleItem[]);
}

function getSales(startDate?: string, endDate?: string) {
    return saleRepository.getSales(startDate, endDate);
}

function getSaleItems(saleId: number | string) {
    return saleRepository.getSaleItems(saleId);
}

function getSaleById(saleId: number | string) {
    return saleRepository.getSaleById(saleId);
}

export { 
    createSale,
    getSales,
    getSaleItems,
    getSaleById
 };
