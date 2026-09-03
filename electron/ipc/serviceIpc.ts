import type { IpcMainInvokeEvent } from 'electron';
import type { ServiceOrder, ServiceItem } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as serviceController from '../../controllers/serviceController';
import * as serviceItemController from '../../controllers/serviceItemController';
import {  validateData, ServiceOrderSchema, ServiceItemSchema  } from '../../src/utils/validators';

function registerServiceIpc() {
  ipcMain.handle('get-services', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number, technicianFilter?: string) => serviceController.getServices(searchQuery, page, limit, technicianFilter));
  ipcMain.handle('get-service', (event: IpcMainInvokeEvent, id: number) => serviceController.getServiceById(id));
  ipcMain.handle('get-service-by-ticket', (event: IpcMainInvokeEvent, ticketNumber: string) => serviceController.getServiceByTicketNumber(ticketNumber));
  ipcMain.handle('get-service-history', (event: IpcMainInvokeEvent, id: number) => serviceController.getServiceStatusHistory(id));
  ipcMain.handle('add-service', (event: IpcMainInvokeEvent, data: Omit<ServiceOrder, 'id'>) => {
    const validData = validateData(ServiceOrderSchema, data) as unknown as ServiceOrder;
    return serviceController.addService(validData);
  });
  ipcMain.handle('update-service-status', (event: IpcMainInvokeEvent, id: number, status: string, notes: string, warrantyDays: number = 0) => serviceController.updateServiceStatus(id, status, notes, warrantyDays));
  ipcMain.handle('update-service-details', (event: IpcMainInvokeEvent, id: number, data: Partial<ServiceOrder>) => {
    const validData = validateData(ServiceOrderSchema.partial(), data) as unknown as Partial<ServiceOrder>;
    return serviceController.updateServiceDetails(id, validData as ServiceOrder);
  });
  ipcMain.handle('delete-service', (event: IpcMainInvokeEvent, id: number) => serviceController.deleteService(id));

  // Service Items
  ipcMain.handle('get-service-items', (event: IpcMainInvokeEvent, serviceId: number) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event: IpcMainInvokeEvent, data: Omit<ServiceItem, 'id'>) => {
    const validData = validateData(ServiceItemSchema, data) as unknown as ServiceItem;
    return serviceItemController.addServiceItem(validData);
  });
  ipcMain.handle('delete-service-item', (event: IpcMainInvokeEvent, id: number) => serviceItemController.deleteServiceItem(id));

  // Warranty
  ipcMain.handle('check-warranty', (event: IpcMainInvokeEvent, deviceId: number) => serviceController.checkWarranty(deviceId));

}

export {  registerServiceIpc  };

export {};

