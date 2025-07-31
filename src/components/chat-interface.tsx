
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from '@/components/chat-message';
import { processCommand } from '@/app/actions';
import { Send, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const initialMessage: Omit<Message, 'timestamp'> = {
    id: 'initial',
    sender: 'bot',
    content: "Welcome to DriveWhizz! I can help you manage your Google Drive. Type 'HELP' to see what I can do.",
};

const getTimestamp = () => {
    if (typeof window === 'undefined') {
        return '';
    }
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ ...initialMessage, timestamp: getTimestamp() }]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: getTimestamp(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processCommand(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: response.message,
        data: response.data,
        timestamp: getTimestamp(),
      };
      setMessages(prev => [...prev, botMessage]);

      if (response.authUrl || response.needsReload) {
        setIsLoading(false);
        if (response.needsReload) {
          window.location.reload();
        }
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: "Sorry, something went wrong. Please try again.",
        timestamp: getTimestamp(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (!input.toUpperCase().startsWith('AUTH') && !input.toUpperCase().startsWith('LOGOUT')) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map(msg => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isLoading && (
             <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                    </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1 pt-2">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/50">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your command..."
            className="flex-1 bg-background"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
