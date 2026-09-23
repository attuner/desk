/**
 * Google Drive API Service
 * Handles cloud file storage, folders, and documents inside 'WebDesktop_Storage'.
 */
import { getAccessToken } from './googleAuth';
import { DriveItem } from '../types/desktop';

const STORAGE_FOLDER_NAME = 'WebDesktop_Storage';
let cachedRootFolderId: string | null = null;

/**
 * Helper to execute authorized Google Drive API requests.
 */
async function driveFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive requires active sign-in. Please sign in with Google.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errorText}`);
  }

  return res;
}

/**
 * Locates or creates the main WebDesktop_Storage folder in Google Drive.
 */
export async function getOrCreateStorageFolder(): Promise<string> {
  if (cachedRootFolderId) return cachedRootFolderId;

  // Search for existing folder
  const query = encodeURIComponent(
    `name = '${STORAGE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`
  );
  const data = await searchRes.json();

  if (data.files && data.files.length > 0) {
    cachedRootFolderId = data.files[0].id;
    return cachedRootFolderId!;
  }

  // Create folder if not found
  const createRes = await driveFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: STORAGE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Storage folder for WebDesktop OS files and documents',
    }),
  });
  const createdData = await createRes.json();
  cachedRootFolderId = createdData.id;
  return cachedRootFolderId!;
}

/**
 * List files inside the storage folder or a specific parent folder.
 */
export async function listDriveFiles(folderId?: string): Promise<DriveItem[]> {
  const targetFolderId = folderId || (await getOrCreateStorageFolder());
  const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
  
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink)&orderBy=folder,name`
  );
  const data = await res.json();

  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    size: f.size ? formatBytes(Number(f.size)) : undefined,
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    parentId: targetFolderId,
    webViewLink: f.webViewLink,
  }));
}

/**
 * Create a new text/code/data file in Google Drive.
 */
export async function createDriveFile(
  name: string,
  content: string,
  mimeType: string = 'text/plain',
  parentFolderId?: string
): Promise<DriveItem> {
  const parentId = parentFolderId || (await getOrCreateStorageFolder());
  const token = await getAccessToken();

  const metadata = {
    name,
    mimeType,
    parents: [parentId],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create file in Google Drive: ${err}`);
  }

  const created = await res.json();
  return {
    id: created.id,
    name: created.name,
    mimeType: created.mimeType,
    isFolder: false,
    parentId,
    content,
  };
}

/**
 * Create a new folder in Google Drive.
 */
export async function createDriveFolder(name: string, parentFolderId?: string): Promise<DriveItem> {
  const parentId = parentFolderId || (await getOrCreateStorageFolder());

  const res = await driveFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });

  const created = await res.json();
  return {
    id: created.id,
    name: created.name,
    mimeType: created.mimeType,
    isFolder: true,
    parentId,
  };
}

/**
 * Read contents of a text file from Google Drive.
 */
export async function readDriveFileContent(fileId: string): Promise<string> {
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  return await res.text();
}

/**
 * Update content of an existing Google Drive file.
 */
export async function updateDriveFileContent(
  fileId: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mimeType,
    },
    body: content,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update Drive file: ${err}`);
  }
}

/**
 * Delete a file or folder from Google Drive.
 * (Note: Caller must enforce user confirmation before executing this method)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
  });
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
