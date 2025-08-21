'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import * as React from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audio?: string;
  attachment?: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Basic markdown to HTML for bold text
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      // Handle newlines by splitting the part and rendering with <br>
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-xl',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
      )}
    >
      {isUser && (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground border">
            <User className="h-5 w-5" />
        </div>
      )}
      <div className={cn(
        "rounded-lg p-3 text-sm shadow-sm", 
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        {message.attachment && (
          <Image
            src={message.attachment}
            alt="Anexo do utilizador"
            width={300}
            height={300}
            className="rounded-md mb-2"
          />
        )}
        <div className="leading-relaxed whitespace-pre-wrap">{renderTextWithBold(message.text)}</div>
        {message.audio && (
          <audio controls src={message.audio} className="mt-2 w-full h-8" />
        )}
      </div>
    </div>
  );
}
