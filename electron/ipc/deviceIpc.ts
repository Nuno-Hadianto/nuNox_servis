import type { IpcMainInvokeEvent } from 'electron';
import type { Device } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as deviceController from '../../controllers/deviceController';
import {  validateData, DeviceSchema  } from '../../src/utils/validators';

function registerDeviceIpc() {
  ipcMain.handle('get-devices', (_event: IpcMainInvokeEvent, searchQuery: string) => deviceController.getDevices(searchQuery));
  ipcMain.handle('get-device', (_event: IpcMainInvokeEvent, id: number) => deviceController.getDeviceById(id));
  ipcMain.handle('get-devices-by-customer', (_event: IpcMainInvokeEvent, customerId: number) => deviceController.getDevicesByCustomerId(customerId));
  ipcMain.handle('add-device', (_event: IpcMainInvokeEvent, data: Omit<Device, 'id'>) => {
    const validData = validateData(DeviceSchema, data) as Omit<Device, 'id'>;
    return deviceController.addDevice(validData as Device);
  });
  ipcMain.handle('update-device', (_event: IpcMainInvokeEvent, id: number, data: Partial<Device>) => {
    const validData = validateData(DeviceSchema.partial(), data) as Partial<Device>;
    return deviceController.updateDevice(id, validData as Device);
  });
  ipcMain.handle('delete-device', (_event: IpcMainInvokeEvent, id: number) => deviceController.deleteDevice(id));
}

export {  registerDeviceIpc  };
