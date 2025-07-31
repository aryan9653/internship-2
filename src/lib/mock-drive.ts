export type DriveFile = {
  type: 'file';
  name: string;
  path: string;
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'text/plain';
  content: string;
};

export type DriveFolder = {
  type: 'folder';
  name: string;
  path: string;
  children: { [key: string]: DriveItem };
};

export type DriveItem = DriveFile | DriveFolder;

let fileSystem: DriveFolder = {
  type: 'folder',
  name: '/',
  path: '/',
  children: {
    'ProjectX': {
      type: 'folder',
      name: 'ProjectX',
      path: '/ProjectX',
      children: {
        'report.pdf': {
          type: 'file',
          name: 'report.pdf',
          path: '/ProjectX/report.pdf',
          mimeType: 'application/pdf',
          content: 'This is the main project report for ProjectX. It details the project goals, milestones, and outcomes. The project was a success and met all its key performance indicators.',
        },
        'data.docx': {
          type: 'file',
          name: 'data.docx',
          path: '/ProjectX/data.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          content: 'This document contains raw data collected during the ProjectX research phase. The data includes survey responses and experimental results.',
        },
      },
    },
    'Archive': {
      type: 'folder',
      name: 'Archive',
      path: '/Archive',
      children: {},
    },
    'notes.txt': {
      type: 'file',
      name: 'notes.txt',
      path: '/notes.txt',
      mimeType: 'text/plain',
      content: 'Quick notes: Remember to follow up with the marketing team. Also, prepare the presentation for the quarterly review.',
    },
  },
};

const findItem = (path: string): { parent: DriveFolder | null; item: DriveItem | null, key: string } => {
  if (path === '/') return { parent: null, item: fileSystem, key: ''};
  const parts = path.split('/').filter(p => p);
  let current: DriveItem = fileSystem;
  let parent: DriveFolder | null = null;
  let key = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current.type !== 'folder' || !current.children[part]) {
      return { parent: null, item: null, key: '' };
    }
    parent = current;
    key = part;
    current = current.children[part];
  }
  return { parent, item: current, key };
};

const listFilesRecursive = (folder: DriveFolder): DriveItem[] => {
    let items: DriveItem[] = [];
    for (const child of Object.values(folder.children)) {
        items.push(child);
        if (child.type === 'folder') {
            items = items.concat(listFilesRecursive(child));
        }
    }
    return items;
}

export const listFiles = (path: string, recursive: boolean = false): DriveItem[] | string => {
  const { item } = findItem(path);
  if (!item) return `Error: Path not found "${path}"`;
  if (item.type !== 'folder') return `Error: Not a folder "${path}"`;

  if (recursive) {
      return listFilesRecursive(item);
  }

  return Object.values(item.children);
};

export const getFile = (path: string): DriveFile | string => {
  const { item } = findItem(path);
  if (!item) return `Error: Path not found "${path}"`;
  if (item.type !== 'file') return `Error: Not a file "${path}"`;
  return item;
};

const updatePaths = (folder: DriveFolder, parentPath: string) => {
    for (const key in folder.children) {
        const child = folder.children[key];
        const newPath = parentPath === '/' ? `/${child.name}` : `${parentPath}/${child.name}`;
        child.path = newPath;
        if (child.type === 'folder') {
            updatePaths(child, newPath);
        }
    }
}

export const deleteFile = (path: string): string => {
  const { parent, item, key } = findItem(path);
  if (!item) return `Error: Path not found "${path}"`;
  if (!parent) return `Error: Cannot delete root`;
  delete parent.children[key];
  return `Successfully deleted "${path}"`;
};

export const moveFile = (sourcePath: string, destPath: string): string => {
  const { parent: sourceParent, item: sourceItem, key: sourceKey } = findItem(sourcePath);
  if (!sourceItem || !sourceParent) return `Error: Source path not found "${sourcePath}"`;
  
  const { item: destItem } = findItem(destPath);
  if (!destItem || destItem.type !== 'folder') return `Error: Destination folder not found or is not a folder "${destPath}"`;
  
  delete sourceParent.children[sourceKey];
  destItem.children[sourceKey] = sourceItem;

  updatePaths(fileSystem, '');


  return `Successfully moved "${sourcePath}" to "${destPath}"`;
};
