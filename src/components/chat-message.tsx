
'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Folder, FileText } from 'lucide-react';
import type { DriveItem } from '@/lib/drive';
import Link from 'next/link';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  data?: any;
}

export function ChatMessage({ sender, content, timestamp, data }: Message) {
  const isUser = sender === 'user';

  const renderContent = () => {
    // Check for auth URL
    const authUrlRegex = /\[(https?:\/\/[^\s\]]+)\]\((https?:\/\/[^\s\]]+)\)/;
    const authMatch = content.match(authUrlRegex);

    if (authMatch) {
        const preText = content.substring(0, authMatch.index);
        const url = authMatch[1];
        return (
            <p className="whitespace-pre-wrap">
                {preText}
                <Link href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                    Authenticate with Google
                </Link>
            </p>
        );
    }

    if (data && Array.isArray(data)) {
        return (
            <div>
                <p className="whitespace-pre-wrap">{content}</p>
                <ul className="mt-2 space-y-1">
                    {data.map((item: DriveItem) => (
                        <li key={item.id} className="flex items-center space-x-2 text-sm p-1 rounded-md hover:bg-muted">
                            {item.type === 'folder' ? <Folder className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className={cn('flex items-start space-x-3', isUser ? 'justify-end' : '')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={20} />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-sm rounded-lg px-4 py-2', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
        <div className="text-sm">
            {renderContent()}
        </div>
        <p className={cn('text-xs mt-1', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground', 'text-right')}>
          {timestamp}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User size={20} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
