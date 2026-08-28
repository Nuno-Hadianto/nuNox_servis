import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export async function uploadToGoogleDrive(
  credentialsJsonStr: string,
  folderId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const credentials = JSON.parse(credentialsJsonStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const fileName = path.basename(filePath);

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(filePath),
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Google Drive Upload Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function testGoogleDriveConnection(
  credentialsJsonStr: string,
  folderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const credentials = JSON.parse(credentialsJsonStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    if (folderId) {
      // Verify folder exists and is accessible
      const res = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType'
      });
      if (res.data.mimeType !== 'application/vnd.google-apps.folder') {
        return { success: false, error: 'ID yang diberikan bukan sebuah folder di Google Drive.' };
      }
    } else {
      // Just list files to test auth
      await drive.files.list({ pageSize: 1 });
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Google Drive Connection Test Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
