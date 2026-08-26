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
exports.registerUserIpc = registerUserIpc;
const electron_1 = require("electron");
const userController = __importStar(require("../../controllers/userController"));
const electron_log_1 = __importDefault(require("electron-log"));
const validators_1 = require("../../src/utils/validators");
function registerUserIpc() {
    electron_1.ipcMain.handle('login', (event, username, password) => {
        try {
            return { success: true, user: userController.login(username, password) };
        }
        catch (err) {
            electron_log_1.default.error('Error in login:', err);
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('get-users', () => userController.getUsers());
    electron_1.ipcMain.handle('get-user', (event, id) => userController.getUserById(id));
    electron_1.ipcMain.handle('add-user', (event, data) => {
        try {
            const validData = (0, validators_1.validateData)(validators_1.UserSchema, data);
            return { success: true, id: userController.addUser(validData) };
        }
        catch (err) {
            electron_log_1.default.error('Error in add-user:', err);
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('update-user', (event, id, data) => {
        try {
            const validData = (0, validators_1.validateData)(validators_1.UserSchema.partial(), data);
            return { success: true, result: userController.updateUser(id, validData) };
        }
        catch (err) {
            electron_log_1.default.error('Error in update-user:', err);
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('delete-user', (event, id) => {
        try {
            return { success: true, result: userController.deleteUser(id) };
        }
        catch (err) {
            electron_log_1.default.error('Error in delete-user:', err);
            return { success: false, error: err.message };
        }
    });
}
