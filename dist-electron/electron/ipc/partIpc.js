"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPartIpc = registerPartIpc;
const electron_1 = require("electron");
const xlsx_1 = __importDefault(require("xlsx"));
const partController = __importStar(require("../../controllers/partController"));
const electron_log_1 = __importDefault(require("electron-log"));
const validators_1 = require("../../src/utils/validators");
function registerPartIpc(mainWindow) {
    electron_1.ipcMain.handle('get-parts', (event, searchQuery) => partController.getParts(searchQuery));
    electron_1.ipcMain.handle('get-part', (event, id) => partController.getPartById(id));
    electron_1.ipcMain.handle('add-part', (event, data) => {
        const validData = (0, validators_1.validateData)(validators_1.SparepartSchema, data);
        return partController.addPart(validData);
    });
    electron_1.ipcMain.handle('update-part', (event, id, data) => {
        const validData = (0, validators_1.validateData)(validators_1.SparepartSchema.partial(), data);
        return partController.updatePart(id, validData);
    });
    electron_1.ipcMain.handle('update-part-stock', (event, id, change, reason, ref_id) => partController.updatePartStock(id, change, reason, ref_id));
    electron_1.ipcMain.handle('delete-part', (event, id) => partController.deletePart(id));
    electron_1.ipcMain.handle('get-low-stock-parts', (event, threshold) => partController.getLowStockParts(threshold));
    electron_1.ipcMain.handle('get-part-logs', (event, id) => partController.getPartLogs(id));
    electron_1.ipcMain.handle('import-parts-excel', async () => {
        try {
            const { canceled, filePaths } = await electron_1.dialog.showOpenDialog(mainWindow, {
                title: 'Pilih File Excel Sparepart',
                filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
                properties: ['openFile']
            });
            if (canceled || filePaths.length === 0)
                return { success: false, canceled: true };
            const filePath = filePaths[0];
            const workbook = xlsx_1.default.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (data.length === 0) {
                return { success: false, error: 'File Excel kosong atau format tidak sesuai.' };
            }
            const result = partController.importParts(data);
            return { success: true, result };
        }
        catch (error) {
            electron_log_1.default.error('Error importing excel:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
}
