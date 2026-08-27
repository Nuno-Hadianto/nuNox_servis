export {};
import type { IpcMainInvokeEvent } from 'electron';
import {  ipcMain  } from 'electron';
import * as saleController from '../../controllers/saleController';
import log from 'electron-log';
import {  validateData, SaleSchema, SaleItemSchema  } from '../../src/utils/validators';

function registerSaleIpc() {
  ipcMain.handle('create-sale', (event: IpcMainInvokeEvent, saleData: unknown, items: unknown[]) => {
    try {
      const validSaleData = validateData(SaleSchema, saleData);
      const validItems = items.map(item => validateData(SaleItemSchema, item));
      const saleId = saleController.createSale(validSaleData, validItems);
      return { success: true, saleId };
    } catch (error) {
      log.error('Error in createSale:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('get-sales', (event: IpcMainInvokeEvent, startDate?: string, endDate?: string) => {
    try {
      return saleController.getSales(startDate, endDate);
    } catch (error) {
      log.error('Error in getSales:', error);
      return [];
    }
  });

  ipcMain.handle('get-sale-items', (event: IpcMainInvokeEvent, saleId: number | string) => {
    try {
      return saleController.getSaleItems(saleId);
    } catch (error) {
      log.error('Error in getSaleItems:', error);
      return [];
    }
  });

  ipcMain.handle('get-sale', (event: IpcMainInvokeEvent, saleId: number | string) => {
    try {
      return saleController.getSaleById(saleId);
    } catch (error) {
      log.error('Error in getSale:', error);
      return null;
    }
  });
}

export default registerSaleIpc;
