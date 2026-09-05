import type { IpcMainInvokeEvent } from 'electron';
import type { Customer } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as customerController from '../../controllers/customerController';
import {  validateData, CustomerSchema  } from '../../src/utils/validators';

function registerCustomerIpc() {
  ipcMain.handle('get-customers', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number, sortBy: string = 'name_asc') => customerController.getCustomers(searchQuery, page, limit, sortBy));
  ipcMain.handle('get-customer', (event: IpcMainInvokeEvent, id: number) => customerController.getCustomerById(id));
  ipcMain.handle('add-customer', (event: IpcMainInvokeEvent, data: Omit<Customer, 'id'>) => {
    const validData = validateData(CustomerSchema, data) as Customer;
    return customerController.addCustomer(validData);
  });
  ipcMain.handle('update-customer', (event: IpcMainInvokeEvent, id: number, data: Partial<Customer>) => {
    const validData = validateData(CustomerSchema.partial(), data) as Partial<Customer>;
    return customerController.updateCustomer(id, validData as Customer);
  });
  ipcMain.handle('delete-customer', (event: IpcMainInvokeEvent, id: number) => customerController.deleteCustomer(id));
}

export {  registerCustomerIpc  };
