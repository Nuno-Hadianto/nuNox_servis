export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { User } from '../../shared/types';
const { ipcMain } = require('electron');
const userController = require('../../controllers/userController');
const log = require('electron-log');
const { validateData, UserSchema } = require('../../src/utils/validators');

function registerUserIpc() {
  ipcMain.handle('login', (event: IpcMainInvokeEvent, username: string, password: string) => {
    try { return { success: true, user: userController.login(username, password) }; }
    catch (err: any) { 
      log.error('Error in login:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('get-users', () => userController.getUsers());
  ipcMain.handle('get-user', (event: IpcMainInvokeEvent, id: number) => userController.getUserById(id));
  ipcMain.handle('add-user', (event: IpcMainInvokeEvent, data: Omit<User, 'id'>) => {
    try {
      const validData = validateData(UserSchema, data);
      return { success: true, id: userController.addUser(validData) };
    }
    catch (err: any) { 
      log.error('Error in add-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('update-user', (event: IpcMainInvokeEvent, id: number, data: Partial<User>) => {
    try {
      const validData = validateData(UserSchema.partial(), data);
      return { success: true, result: userController.updateUser(id, validData) };
    }
    catch (err: any) { 
      log.error('Error in update-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('delete-user', (event: IpcMainInvokeEvent, id: number) => {
    try { return { success: true, result: userController.deleteUser(id) }; }
    catch (err: any) { 
      log.error('Error in delete-user:', err);
      return { success: false, error: err.message }; 
    }
  });
}

module.exports = { registerUserIpc };
