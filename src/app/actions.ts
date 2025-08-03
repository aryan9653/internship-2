
'use server';

import { summarizeFileContent } from '@/ai/flows/summarize-file-content';

type Command =
  | { type: 'SUMMARY'; path?: string }
  | { type: 'HELP' }
  | { type: 'UNKNOWN'; input: string };

function parseCommand(input: string): Command {
  const sanitizedInput = input.replace(/`/g, '').split(':')[0].trim();
  const parts = sanitizedInput.trim().split(/\s+/);
  const command = parts[0]?.toUpperCase();

  switch (command) {
    case 'SUMMARY':
      return { type: 'SUMMARY', path: parts[1] };
    case 'HELP':
      return { type: 'HELP' };
    default:
      return { type: 'UNKNOWN', input: sanitizedInput };
  }
}

const HELP_MESSAGE = `Welcome to DriveWhizz! Here are the available commands:
- \`SUMMARY\`: Summarizes the content of a file.
- \`HELP\`: Shows this help message.`;

export async function processCommand(commandStr: string): Promise<{ message: string; data?: any }> {
  const parsed = parseCommand(commandStr);

  switch (parsed.type) {
    case 'HELP':
      return { message: HELP_MESSAGE };

    case 'SUMMARY': {
        return { message: "The summary functionality is not fully implemented yet. Please check back later!" };
    }

    case 'UNKNOWN':
      return { message: `Unknown command: "${parsed.input}". Type "HELP" for a list of commands.` };

    default:
      const exhaustiveCheck: never = parsed;
      return { message: `Command not implemented.` };
  }
}
