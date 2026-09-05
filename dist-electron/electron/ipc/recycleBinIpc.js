"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRecycleBinIpc = registerRecycleBinIpc;
const electron_1 = require("electron");
const recycleBinController_1 = __importDefault(require("../../controllers/recycleBinController"));
function registerRecycleBinIpc() {
    electron_1.ipcMain.handle('get-deleted-items', () => recycleBinController_1.default.getDeletedItems());
    electron_1.ipcMain.handle('restore-item', (event, id, type) => recycleBinController_1.default.restoreItem(id, type));
    electron_1.ipcMain.handle('hard-delete-item', (event, id, type) => recycleBinController_1.default.hardDeleteItem(id, type));
}
