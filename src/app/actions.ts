
'use server';

import { listFiles, deleteFile, moveFile, getFile, DriveItem } from '@/lib/mock-drive';
import { summarizeFileContent } from '@/ai/flows/summarize-file-content';

type Command = 
  | { type: 'LIST', path: string }
  | { type: 'DELETE', path: string, confirm: boolean }
  | { type: 'MOVE', source: string, dest: string }
  | { type: 'SUMMARY', path?: string }
  | { type: 'HELP' }
  | { type: 'UNKNOWN', input: string };

function parseCommand(input: string): Command {
  const parts = input.trim().split(/\s+/);
  const command = parts[0]?.toUpperCase();
  
  switch (command) {
    case 'LIST':
      return { type: 'LIST', path: parts[1] || '/' };
    case 'DELETE':
      return { type: 'DELETE', path: parts[1], confirm: parts[2]?.toLowerCase() === 'confirm' };
    case 'MOVE':
      return { type: 'MOVE', source: parts[1], dest: parts[2] };
    case 'SUMMARY':
      return { type: 'SUMMARY', path: parts[1] };
    case 'HELP':
      return { type: 'HELP' };
    default:
      return { type: 'UNKNOWN', input };
  }
}

function formatFileList(items: DriveItem[]): string {
    if (items.length === 0) {
        return "This folder is empty.";
    }
    return 'Files in folder:\n' + items.map(item => `${item.type === 'folder' ? '📁' : '📄'} ${item.name}`).join('\n');
}

const HELP_MESSAGE = `Welcome to DriveWhizz! Here are the available commands:
- \`LIST /path/to/folder\`: Lists files and folders.
- \`MOVE /source/path /dest/folder\`: Moves a file or folder.
- \`DELETE /path/to/file\`: Deletes a file. Requires confirmation.
- \`SUMMARY /path/to/file\`: Summarizes the content of a file (PDF/Docx/TXT).
- \`HELP\`: Shows this help message.`;

export async function processCommand(commandStr: string): Promise<{ message: string, data?: any }> {
  const parsed = parseCommand(commandStr);

  switch (parsed.type) {
    case 'HELP':
      return { message: HELP_MESSAGE };

    case 'LIST': {
      if (!parsed.path) return { message: 'Error: Please specify a path for LIST.' };
      const result = listFiles(parsed.path);
      if (typeof result === 'string') return { message: result };
      return { message: `Contents of ${parsed.path}:`, data: result };
    }

    case 'DELETE': {
        if (!parsed.path) return { message: 'Error: Please specify a file path to delete.' };
        if (!parsed.confirm) {
            return { message: `Are you sure you want to want to delete "${parsed.path}"? Please reply with \`DELETE ${parsed.path} confirm\` to proceed.` };
        }
        const result = deleteFile(parsed.path);
        return { message: result };
    }

    case 'MOVE': {
        if (!parsed.source || !parsed.dest) return { message: 'Error: Please specify a source and destination for MOVE.' };
        const result = moveFile(parsed.source, parsed.dest);
        return { message: result };
    }

    case 'SUMMARY': {
        if (!parsed.path) {
            const allFiles = listFiles('/', true); // Recursive list
            if (typeof allFiles === 'string') {
                 return { message: "Which file would you like to summarize? I couldn't list the files." };
            }
            const fileList = allFiles.filter(i => i.type === 'file').map(i => i.path).join('\n - ');
            return { message: `Which file would you like to summarize? Please use \`SUMMARY /path/to/file\`. Available files:\n - ${fileList}` };
        }
        const file = getFile(parsed.path);
        if (typeof file === 'string') return { message: file };
        
        try {
            const fileContent = file.content;
            const base64Content = Buffer.from(fileContent).toString('base64');
            const dataUri = `data:${file.mimeType};base64,${base64Content}`;

            const result = await summarizeFileContent({ fileDataUri: dataUri });
            return { message: `Summary for ${file.name}:\n${result.summary}` };
        } catch (error) {
            console.error(error);
            return { message: 'An error occurred while summarizing the file.' };
        }
    }

    case 'UNKNOWN':
      return { message: `Unknown command: "${parsed.input}". Type "HELP" for a list of commands.` };
  }
}
