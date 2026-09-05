import { ipcMain, IpcMainInvokeEvent } from 'electron';
import recycleBinController from '../../controllers/recycleBinController';

export function registerRecycleBinIpc() {
  ipcMain.handle('get-deleted-items', () => recycleBinController.getDeletedItems());
  ipcMain.handle('restore-item', (event: IpcMainInvokeEvent, id: number, type: 'customer' | 'device' | 'service' | 'part') => recycleBinController.restoreItem(id, type));
  ipcMain.handle('hard-delete-item', (event: IpcMainInvokeEvent, id: number, type: 'customer' | 'device' | 'service' | 'part') => recycleBinController.hardDeleteItem(id, type));
}
