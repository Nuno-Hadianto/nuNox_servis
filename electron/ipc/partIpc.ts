export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Part } from '../../shared/types';
import {  ipcMain  } from 'electron';
import * as partController from '../../controllers/partController';



function registerPartIpc() {
  ipcMain.handle('get-parts', (event: IpcMainInvokeEvent, searchQuery: string, page: number, limit: number) => partController.getParts(searchQuery, page, limit));
  ipcMain.handle('get-part', (event: IpcMainInvokeEvent, id: number) => partController.getPartById(id));
  ipcMain.handle('add-part', (event: IpcMainInvokeEvent, data: Omit<Part, 'id'>) => {
    return partController.addPart(data);
  });
  ipcMain.handle('update-part', (event: IpcMainInvokeEvent, id: number, data: Omit<Part, 'id'>) => {
    return partController.updatePart(id, data);
  });

  ipcMain.handle('delete-part', (event: IpcMainInvokeEvent, id: number) => partController.deletePart(id));


}

export {  registerPartIpc  };
