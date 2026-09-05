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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPartIpc = registerPartIpc;
const electron_1 = require("electron");
const partController = __importStar(require("../../controllers/partController"));
function registerPartIpc() {
    electron_1.ipcMain.handle('get-parts', (event, searchQuery, page, limit, sortBy = 'name_asc') => partController.getParts(searchQuery, page, limit, sortBy));
    electron_1.ipcMain.handle('get-part', (event, id) => partController.getPartById(id));
    electron_1.ipcMain.handle('add-part', (event, data) => {
        return partController.addPart(data);
    });
    electron_1.ipcMain.handle('update-part', (event, id, data) => {
        return partController.updatePart(id, data);
    });
    electron_1.ipcMain.handle('delete-part', (event, id) => partController.deletePart(id));
}
