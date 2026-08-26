export {};
import type { IpcMainInvokeEvent } from 'electron';
const { ipcMain } = require('electron');
const saleController = require('../../controllers/saleController');
const log = require('electron-log');
const { validateData, SaleSchema, SaleItemSchema } = require('../../src/utils/validators');

function registerSaleIpc(mainWindow: any) {
  ipcMain.handle('create-sale', (event: IpcMainInvokeEvent, saleData: any, items: any[]) => {
    try {
      const validSaleData = validateData(SaleSchema, saleData);
      const validItems = items.map(item => validateData(SaleItemSchema, item));
      const saleId = saleController.createSale(validSaleData, validItems);
      return { success: true, saleId };
    } catch (error: any) {
      log.error('Error in createSale:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-sales', (event: IpcMainInvokeEvent, startDate?: string, endDate?: string) => {
    try {
      return saleController.getSales(startDate, endDate);
    } catch (error: any) {
      log.error('Error in getSales:', error);
      return [];
    }
  });

  ipcMain.handle('get-sale-items', (event: IpcMainInvokeEvent, saleId: number | string) => {
    try {
      return saleController.getSaleItems(saleId);
    } catch (error: any) {
      log.error('Error in getSaleItems:', error);
      return [];
    }
  });

  ipcMain.handle('get-sale', (event: IpcMainInvokeEvent, saleId: number | string) => {
    try {
      return saleController.getSaleById(saleId);
    } catch (error: any) {
      log.error('Error in getSale:', error);
      return null;
    }
  });
}

module.exports = registerSaleIpc;
