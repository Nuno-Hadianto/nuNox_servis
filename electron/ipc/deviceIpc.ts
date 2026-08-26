import {  ipcMain  } from 'electron';
import * as deviceController from '../../controllers/deviceController';
import {  validateData, DeviceSchema  } from '../../src/utils/validators';

function registerDeviceIpc() {
  ipcMain.handle('get-devices', (event, searchQuery) => deviceController.getDevices(searchQuery));
  ipcMain.handle('get-device', (event, id) => deviceController.getDeviceById(id));
  ipcMain.handle('get-devices-by-customer', (event, customerId) => deviceController.getDevicesByCustomerId(customerId));
  ipcMain.handle('add-device', (event, data) => {
    const validData = validateData(DeviceSchema, data);
    return deviceController.addDevice(validData);
  });
  ipcMain.handle('update-device', (event, id, data) => {
    const validData = validateData(DeviceSchema.partial(), data);
    return deviceController.updateDevice(id, validData);
  });
  ipcMain.handle('delete-device', (event, id) => deviceController.deleteDevice(id));
}

export {  registerDeviceIpc  };
