export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Part } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as partController from '../../controllers/partController';

import {  validateData, SparepartSchema  } from '../../src/utils/validators';

function registerPartIpc() {
  ipcMain.handle('get-parts', (event: IpcMainInvokeEvent, searchQuery: string) => partController.getParts(searchQuery));
  ipcMain.handle('get-part', (event: IpcMainInvokeEvent, id: number) => partController.getPartById(id));
  ipcMain.handle('add-part', (event: IpcMainInvokeEvent, data: Omit<Part, 'id'>) => {
    const validData = validateData(SparepartSchema, data);
    return partController.addPart(validData as Omit<Part, 'id'>);
  });
  ipcMain.handle('update-part', (event: IpcMainInvokeEvent, id: number, data: Omit<Part, 'id'>) => {
    const validData = validateData(SparepartSchema.partial(), data);
    return partController.updatePart(id, validData as Omit<Part, 'id'>);
  });
  ipcMain.handle('update-part-stock', (event: IpcMainInvokeEvent, id: number, change: number, reason?: string, ref_id?: string) => partController.updatePartStock(id, change, reason, ref_id));
  ipcMain.handle('delete-part', (event: IpcMainInvokeEvent, id: number) => partController.deletePart(id));
  ipcMain.handle('get-low-stock-parts', (event: IpcMainInvokeEvent, threshold: number) => partController.getLowStockParts(threshold));
  ipcMain.handle('get-part-logs', (event: IpcMainInvokeEvent, id: number) => partController.getPartLogs(id));

}

export {  registerPartIpc  };
