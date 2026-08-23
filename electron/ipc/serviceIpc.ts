import type { IpcMainInvokeEvent } from 'electron';
import type { ServiceOrder, ServiceItem } from '../../src/types';
const { ipcMain } = require('electron');
const serviceController = require('../../controllers/serviceController');
const serviceItemController = require('../../controllers/serviceItemController');
const log = require('electron-log');

function registerServiceIpc() {
  ipcMain.handle('get-services', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number) => serviceController.getServices(searchQuery, page, limit));
  ipcMain.handle('get-service', (event: IpcMainInvokeEvent, id: number) => serviceController.getServiceById(id));
  ipcMain.handle('get-service-by-ticket', (event: IpcMainInvokeEvent, ticketNumber: string) => serviceController.getServiceByTicketNumber(ticketNumber));
  ipcMain.handle('get-service-history', (event: IpcMainInvokeEvent, id: number) => serviceController.getServiceStatusHistory(id));
  ipcMain.handle('add-service', (event: IpcMainInvokeEvent, data: Omit<ServiceOrder, 'id'>) => serviceController.addService(data));
  ipcMain.handle('update-service-status', (event: IpcMainInvokeEvent, id: number, status: string, notes: string, warrantyDays: number = 0) => serviceController.updateServiceStatus(id, status, notes, warrantyDays));
  ipcMain.handle('update-service-details', (event: IpcMainInvokeEvent, id: number, data: Partial<ServiceOrder>) => serviceController.updateServiceDetails(id, data));
  ipcMain.handle('delete-service', (event: IpcMainInvokeEvent, id: number) => serviceController.deleteService(id));

  // Service Items
  ipcMain.handle('get-service-items', (event: IpcMainInvokeEvent, serviceId: number) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event: IpcMainInvokeEvent, data: Omit<ServiceItem, 'id'>) => serviceItemController.addServiceItem(data));
  ipcMain.handle('delete-service-item', (event: IpcMainInvokeEvent, id: number) => serviceItemController.deleteServiceItem(id));

  // Warranty
  ipcMain.handle('check-warranty', (event: IpcMainInvokeEvent, deviceId: number) => serviceController.checkWarranty(deviceId));

  // Photos
  const fs = require('fs');
  const path = require('path');
  const { app } = require('electron');

  ipcMain.handle('upload-photo', async (event: IpcMainInvokeEvent, serviceId: number, type: string, buffer: Buffer, fileName: string) => {
    try {
      const photosDir = path.join(app.getPath('userData'), 'photos');
      const uniqueName = Date.now() + '_' + fileName;
      const filepath = path.join(photosDir, uniqueName);
      
      fs.writeFileSync(filepath, Buffer.from(buffer));
      
      const id = serviceController.addPhoto(serviceId, type, filepath);
      return { success: true, id, filepath };
    } catch (e: any) {
      log.error('Error in upload-photo:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-photos', (event: IpcMainInvokeEvent, serviceId: number) => serviceController.getPhotos(serviceId));

  ipcMain.handle('delete-photo', (event: IpcMainInvokeEvent, id: number) => {
    const photo = serviceController.getPhotoById(id);
    if (photo && photo.filepath) {
      try {
        fs.unlinkSync(photo.filepath);
      } catch (e) {
        log.error("Failed to delete photo from disk:", e);
      }
    }
    return serviceController.deletePhoto(id);
  });
}

module.exports = { registerServiceIpc };

export {};
