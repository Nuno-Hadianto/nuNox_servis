import type { IpcMainInvokeEvent } from 'electron';
import type { Customer } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as customerController from '../../controllers/customerController';
import {  validateData, CustomerSchema  } from '../../src/utils/validators';

function registerCustomerIpc() {
  ipcMain.handle('get-customers', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number) => customerController.getCustomers(searchQuery, page, limit));
  ipcMain.handle('get-customer', (event: IpcMainInvokeEvent, id: number) => customerController.getCustomerById(id));
  ipcMain.handle('add-customer', (event: IpcMainInvokeEvent, data: Omit<Customer, 'id'>) => {
    const validData = validateData(CustomerSchema, data) as any;
    return customerController.addCustomer(validData);
  });
  ipcMain.handle('update-customer', (event: IpcMainInvokeEvent, id: number, data: Partial<Customer>) => {
    // For partial updates, we might want a Partial schema, but since the form usually sends everything, we'll validate.
    // However, since it's Partial<Customer>, we can use CustomerSchema.partial()
    const validData = validateData(CustomerSchema.partial(), data) as any;
    return customerController.updateCustomer(id, validData);
  });
  ipcMain.handle('delete-customer', (event: IpcMainInvokeEvent, id: number) => customerController.deleteCustomer(id));
}

export {  registerCustomerIpc  };
