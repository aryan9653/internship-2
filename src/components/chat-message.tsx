
'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  data?: any;
}

export function ChatMessage({ sender, content, timestamp }: Message) {
  const isUser = sender === 'user';

  const renderContent = () => {
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
        <p className={cn('text-xs mt-1 text-right', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
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
