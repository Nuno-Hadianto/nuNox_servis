"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToGoogleDrive = uploadToGoogleDrive;
exports.testGoogleDriveConnection = testGoogleDriveConnection;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function uploadToGoogleDrive(credentialsJsonStr, folderId, filePath) {
    try {
        const credentials = JSON.parse(credentialsJsonStr);
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        const fileName = path_1.default.basename(filePath);
        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : undefined,
        };
        const media = {
            mimeType: 'application/zip',
            body: fs_1.default.createReadStream(filePath),
        };
        await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });
        return { success: true };
    }
    catch (error) {
        console.error('Google Drive Upload Error:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
async function testGoogleDriveConnection(credentialsJsonStr, folderId) {
    try {
        const credentials = JSON.parse(credentialsJsonStr);
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
        });
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        if (folderId) {
            // Verify folder exists and is accessible
            const res = await drive.files.get({
                fileId: folderId,
                fields: 'id, name, mimeType'
            });
            if (res.data.mimeType !== 'application/vnd.google-apps.folder') {
                return { success: false, error: 'ID yang diberikan bukan sebuah folder di Google Drive.' };
            }
        }
        else {
            // Just list files to test auth
            await drive.files.list({ pageSize: 1 });
        }
        return { success: true };
    }
    catch (error) {
        console.error('Google Drive Connection Test Error:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
