
'use server';

import { google } from 'googleapis';
import { getOAuth2Client } from './auth';

export type DriveFile = {
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    type: 'file';
    path?: string | null;
};

export type DriveFolder = {
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    type: 'folder';
    path?: string | null;
};

export type DriveItem = DriveFile | DriveFolder;

async function getDrive() {
    const auth = await getOAuth2Client();
    if (!auth) return null;
    return google.drive({ version: 'v3', auth });
}

export async function listFiles(path: string): Promise<DriveItem[] | string> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated. Please type AUTH to authenticate.';

    try {
        let folderId = 'root';
        if (path !== '/') {
            const findId = await findItemId(path);
            if (typeof findId !== 'string') return `Error: Path not found "${path}"`;
            folderId = findId;
        }

        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'folder,name',
        });

        const files = res.data.files;
        if (!files) return [];

        return files.map(file => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            path: `${path === '/' ? '' : path}/${file.name}`,
            type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file'
        }));
    } catch (error: any) {
        console.error('Error listing files:', error);
        return `Error listing files: ${error.message}`;
    }
}

async function findItemId(path: string): Promise<string | DriveItem> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated.';

    const parts = path.split('/').filter(p => p);
    let currentId = 'root';
    let currentPath = '';
    let lastItem: DriveItem | null = null;

    for (const part of parts) {
        currentPath = `${currentPath}/${part}`;
        const res = await drive.files.list({
            q: `'${currentId}' in parents and name = '${part}' and trashed = false`,
            fields: 'files(id, name, mimeType)',
        });

        if (!res.data.files || res.data.files.length === 0) {
            return `Error: Path not found at "${currentPath}"`;
        }
        
        const file = res.data.files[0];
        currentId = file.id!;
        lastItem = {
            id: file.id,
            name: file.name,
            path,
            mimeType: file.mimeType,
            type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        }
    }
    
    return lastItem!.id!;
}

export async function getFile(path: string): Promise<DriveFile | string> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated.';

    const itemId = await findItemId(path);
    if (typeof itemId !== 'string') {
        const item = itemId as DriveItem;
        if(item.type === 'file'){
            return item as DriveFile;
        } else {
             return `Error: Not a file "${path}"`;
        }
    }
    
    //This part seems wrong, let's see what happens
    const fileRes = await drive.files.get({ fileId: itemId, fields: 'id, name, mimeType' });
    const file = fileRes.data;

    if (file.mimeType === 'application/vnd.google-apps.folder') return `Error: Not a file "${path}"`;

    return {
        id: file.id,
        name: file.name,
        path: path,
        mimeType: file.mimeType,
        type: 'file',
    };
}

export async function getFileContent(fileId: string): Promise<Buffer | string> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated.';

    try {
        const res = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );
        return Buffer.from(res.data as any);
    } catch (error: any) {
        // Fallback for Google Docs/Sheets etc.
        try {
            const res = await drive.files.export(
                { fileId: fileId, mimeType: 'application/pdf' },
                { responseType: 'arraybuffer' }
            );
            return Buffer.from(res.data as any);
        } catch (exportError: any) {
            console.error('Error getting file content:', error);
            return `Error getting file content: ${error.message}`;
        }
    }
}


export async function deleteFile(path: string): Promise<string> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated.';

    const fileId = await findItemId(path);
    if (typeof fileId !== 'string') return `Error: Path not found "${path}"`;

    try {
        await drive.files.delete({ fileId });
        return `Successfully deleted "${path}"`;
    } catch (error: any) {
        console.error('Error deleting file:', error);
        return `Error deleting file: ${error.message}`;
    }
}

export async function moveFile(sourcePath: string, destPath: string): Promise<string> {
    const drive = await getDrive();
    if (!drive) return 'Error: Not authenticated.';

    const sourceId = await findItemId(sourcePath);
    if (typeof sourceId !== 'string') return `Error: Source path not found "${sourcePath}"`;

    const destId = await findItemId(destPath);
    if (typeof destId !== 'string') return `Error: Destination folder not found or is not a folder "${destPath}"`;
    
    const file = await drive.files.get({ fileId: sourceId, fields: 'parents' });
    const previousParents = file.data.parents?.join(',');

    try {
        await drive.files.update({
            fileId: sourceId,
            addParents: destId,
            removeParents: previousParents,
            fields: 'id, parents',
        });
        return `Successfully moved "${sourcePath}" to "${destPath}"`;
    } catch (error: any) {
        console.error('Error moving file:', error);
        return `Error moving file: ${error.message}`;
    }
}
