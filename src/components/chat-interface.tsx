
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from '@/components/chat-message';
import { processCommand } from '@/app/actions';
import { Send, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from './auth-provider';

const initialMessage: Omit<Message, 'timestamp'> = {
  id: 'initial',
  sender: 'bot',
  content: "Welcome to DriveWhizz! Please sign in to manage your Google Drive. Type 'HELP' to see what I can do once you're signed in.",
};

const getTimestamp = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [initialTimestamp, setInitialTimestamp] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setInitialTimestamp(getTimestamp());
  }, []);

  useEffect(() => {
    if (messages.length === 0 && initialTimestamp) {
        const welcomeMessage = isAuthenticated
            ? "Welcome back! Type 'HELP' to see what I can do."
            : "Welcome to DriveWhizz! Please sign in to manage your Google Drive. Type 'HELP' to see available commands after signing in.";
      setMessages([{ ...initialMessage, content: welcomeMessage, timestamp: initialTimestamp }]);
    }
  }, [initialTimestamp, isAuthenticated]);

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
    if (!input.trim() || isLoading || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
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
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t bg-muted/50 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAuthenticated ? 'Type your command...' : 'Please sign in to continue'}
            className="flex-1 bg-background"
            disabled={isLoading || !isAuthenticated}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !isAuthenticated}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
