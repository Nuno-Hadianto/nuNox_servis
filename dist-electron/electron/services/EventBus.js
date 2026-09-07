"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
exports.EventBus = {
    /**
     * Mengirim event ke semua window aktif
     */
    broadcast(event) {
        const windows = electron_1.BrowserWindow.getAllWindows();
        windows.forEach(win => {
            if (!win.isDestroyed()) {
                win.webContents.send('system-event', event);
            }
        });
        // Log juga di backend
        if (event.level === 'error') {
            electron_log_1.default.error(`[EventBus] ${event.type}: ${event.message}`);
        }
        else {
            electron_log_1.default.info(`[EventBus] ${event.type}: ${event.message}`);
        }
    },
    /**
     * Helper untuk mengirim toast
     */
    sendToast(level, message) {
        this.broadcast({
            type: 'toast',
            level,
            message
        });
    }
};
