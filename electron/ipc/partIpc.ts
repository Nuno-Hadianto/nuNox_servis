export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Part } from '../../src/types';
const { ipcMain, dialog } = require('electron');
const xlsx = require('xlsx');
const partController = require('../../controllers/partController');
const log = require('electron-log');

function registerPartIpc(mainWindow: any) {
  ipcMain.handle('get-parts', (event: IpcMainInvokeEvent, searchQuery: string) => partController.getParts(searchQuery));
  ipcMain.handle('get-part', (event: IpcMainInvokeEvent, id: number) => partController.getPartById(id));
  ipcMain.handle('add-part', (event: IpcMainInvokeEvent, data: Omit<Part, 'id'>) => partController.addPart(data));
  ipcMain.handle('update-part', (event: IpcMainInvokeEvent, id: number, data: Partial<Part>) => partController.updatePart(id, data));
  ipcMain.handle('update-part-stock', (event: IpcMainInvokeEvent, id: number, change: number) => partController.updatePartStock(id, change));
  ipcMain.handle('delete-part', (event: IpcMainInvokeEvent, id: number) => partController.deletePart(id));
  ipcMain.handle('get-low-stock-parts', (event: IpcMainInvokeEvent, threshold: number) => partController.getLowStockParts(threshold));

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

      const result = partController.importParts(data);
      return { success: true, result };
    } catch (error: any) {
      log.error('Error importing excel:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerPartIpc };
