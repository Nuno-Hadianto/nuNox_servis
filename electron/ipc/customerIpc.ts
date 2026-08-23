import type { IpcMainInvokeEvent } from 'electron';
import type { Customer } from '../../src/types';
const { ipcMain } = require('electron');
const customerController = require('../../controllers/customerController');

function registerCustomerIpc() {
  ipcMain.handle('get-customers', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number) => customerController.getCustomers(searchQuery, page, limit));
  ipcMain.handle('get-customer', (event: IpcMainInvokeEvent, id: number) => customerController.getCustomerById(id));
  ipcMain.handle('add-customer', (event: IpcMainInvokeEvent, data: Omit<Customer, 'id'>) => customerController.addCustomer(data));
  ipcMain.handle('update-customer', (event: IpcMainInvokeEvent, id: number, data: Partial<Customer>) => customerController.updateCustomer(id, data));
  ipcMain.handle('delete-customer', (event: IpcMainInvokeEvent, id: number) => customerController.deleteCustomer(id));
}

module.exports = { registerCustomerIpc };
