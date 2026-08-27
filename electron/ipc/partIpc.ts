export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Part } from '../../shared/types';
import {  ipcMain, dialog  } from 'electron';
import xlsx from 'xlsx';
import * as partController from '../../controllers/partController';
import log from 'electron-log';
import {  validateData, SparepartSchema  } from '../../src/utils/validators';

function registerPartIpc(mainWindow: Electron.BrowserWindow) {
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

  ipcMain.handle('import-parts-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Pilih File Excel Sparepart',
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { success: false, canceled: true };

      const filePath = filePaths[0];
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (data.length === 0) {
        return { success: false, error: 'File Excel kosong atau format tidak sesuai.' };
      }

      const result = partController.importParts(data as Partial<Part>[]);
      return { success: true, result };
    } catch (error: unknown) {
      log.error('Error importing excel:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}

export {  registerPartIpc  };
