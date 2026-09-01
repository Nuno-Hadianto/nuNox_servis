import db from '../../database/db';
export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Settings, Payment } from '../../shared/types';
import {  app, ipcMain, dialog, shell, BrowserWindow, Notification  } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import xlsx from 'xlsx';
import url from 'url';

import * as dashboardController from '../../controllers/dashboardController';
import * as paymentController from '../../controllers/paymentController';
import * as settingsController from '../../controllers/settingsController';
import * as reportController from '../../controllers/reportController';
import log from 'electron-log';

import { askGemini } from '../utils/geminiAi';
import * as settingsRepo from '../../repositories/settingsRepository';

function registerMiscIpc(mainWindow: BrowserWindow) {
  // Dashboard
  ipcMain.handle('get-dashboard-stats', () => dashboardController.getDashboardStats());
  ipcMain.handle('get-alerts', () => dashboardController.getAlerts());

  // Native Notifications
  ipcMain.handle('show-notification', (_event: IpcMainInvokeEvent, { title, body }: { title: string, body: string }) => {
    new Notification({ title, body }).show();
    return true;
  });

  // Payments
  ipcMain.handle('get-payments', (_event: IpcMainInvokeEvent, serviceId: number) => paymentController.getPaymentsByServiceId(serviceId));
  ipcMain.handle('add-payment', (_event: IpcMainInvokeEvent, data: Omit<Payment, 'id'>) => paymentController.addPayment(data));
  ipcMain.handle('delete-payment', (_event: IpcMainInvokeEvent, id: number) => paymentController.deletePayment(id));

  // Settings
  ipcMain.handle('get-settings', () => settingsController.getSettings());
  ipcMain.handle('update-settings', (_event: IpcMainInvokeEvent, data: Settings) => settingsController.updateSettings(data));

  // Reports
  ipcMain.handle('get-income-report', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getIncomeReport(start, end));
  ipcMain.handle('get-completed-services', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getCompletedServices(start, end));
  ipcMain.handle('get-top-spareparts', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getTopSpareparts(start, end));
  ipcMain.handle('get-report-breakdown', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getReportBreakdown(start, end));

  // Backup & Restore
  ipcMain.handle('backup-database', async () => {
    // const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
    const defaultPath = `nuNox_servis_Backup_${new Date().toISOString().split('T')[0]}.db`;
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: defaultPath,
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePath) {
      await db.backup(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('select-directory', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Pilih Folder',
      properties: ['openDirectory']
    });
    if (filePaths && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
      db.close();
      fs.copyFileSync(filePaths[0], dbPath);
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 2500);
      return true;
    }
    return false;
  });



  // AI Assistant
  ipcMain.handle('ask-ai', async (_event: IpcMainInvokeEvent, prompt: string) => {
    const settings = settingsRepo.getSettings();
    const apiKey = settings.gemini_api_key;
    if (!apiKey) {
      return { success: false, error: 'API Key Gemini belum diatur di Pengaturan.' };
    }
    return askGemini(prompt, String(apiKey));
  });

  // Export & Print
  ipcMain.handle('export-excel', async (_event: IpcMainInvokeEvent, data: unknown[], filename?: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan Laporan Excel',
        defaultPath: filename || 'Laporan_nuNox_servis.xlsx',
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      const worksheet = xlsx.utils.json_to_sheet(data);
      const colWidths = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      worksheet['!cols'] = colWidths;

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Laporan');

      xlsx.writeFile(workbook, filePath);
      return { success: true, filePath };
    } catch (error: unknown) {
      log.error('Error exporting excel:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('export-pdf', async (_event: IpcMainInvokeEvent, { html, filename }: { html: string, filename: string }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan PDF',
        defaultPath: filename || 'Invoice.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      const pdfWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
      const tmpHtmlPath = path.join(os.tmpdir(), `print_${Date.now()}.html`);
      fs.writeFileSync(tmpHtmlPath, html, 'utf-8');
      
      await pdfWindow.loadURL(url.pathToFileURL(tmpHtmlPath).href);
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfData = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
      fs.writeFileSync(filePath, pdfData);
      pdfWindow.close();
      try {
        fs.unlinkSync(tmpHtmlPath);
      } catch {
        // ignore
      }
      
      return { success: true, filePath };
    } catch (error: unknown) {
      log.error('Error generating PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('print-preview', async (_event: IpcMainInvokeEvent, options: Record<string, unknown> = {}) => {
    try {
      const pdfPath = path.join(os.tmpdir(), `nunox_print_${Date.now()}.pdf`);
      const pdfOptions: Record<string, unknown> = {
        printBackground: true,
        landscape: options.landscape || false,
        marginsType: 1
      };
      if (options.pageSize) {
        pdfOptions.pageSize = options.pageSize;
      }
      const pdfData = await mainWindow.webContents.printToPDF(pdfOptions);
      fs.writeFileSync(pdfPath, pdfData);
      await shell.openPath(pdfPath);
      return true;
    } catch (error: unknown) {
      log.error('Error generating print preview:', error);
      throw error;
    }
  });

  ipcMain.handle('get-printers', async () => {
    try {
      if (mainWindow && mainWindow.webContents) {
        const printers = await mainWindow.webContents.getPrintersAsync();
        return printers;
      }
      return [];
    } catch (error) {
      log.error('Error getting printers:', error);
      return [];
    }
  });

  ipcMain.handle('silent-print', async (_event: IpcMainInvokeEvent, { html, printerName }: { html: string, printerName: string }) => {
    try {
      return new Promise((resolve) => {
        const printWindow = new BrowserWindow({ 
          show: false, 
          webPreferences: { nodeIntegration: false } 
        });

        // Load the HTML content
        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        printWindow.webContents.on('did-finish-load', () => {
          printWindow.webContents.print({ 
            silent: true, 
            deviceName: printerName,
            printBackground: true,
            margins: { marginType: 'none' }
          }, (success, errorType) => {
            if (!success) {
              log.error(`Print failed: ${errorType}`);
            }
            printWindow.close();
            resolve(success);
          });
        });
      });
    } catch (error: unknown) {
      log.error('Error silent printing:', error);
      return false;
    }
  });

  ipcMain.handle('open-external-url', async (_event: IpcMainInvokeEvent, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error: unknown) {
      log.error('Failed to open external url:', error);
      return false;
    }
  });

  ipcMain.handle('get-logo-base64', async () => {
    try {
      const logoPath = path.join(__dirname, '..', '..', '..', 'public', 'img', 'logo.png');
      if (fs.existsSync(logoPath)) {
        const ext = path.extname(logoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');
        const bitmap = fs.readFileSync(logoPath);
        return `data:${mimeType};base64,${bitmap.toString('base64')}`;
      }
      return null;
    } catch (error: unknown) {
      log.error('Failed to read logo:', error);
      return null;
    }
  });
}

export {  registerMiscIpc  };

