
'use client';

import * as React from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { QuickReplies } from './quick-replies';
import { respondToUserQuery } from '@/ai/flows/respond-to-user-query';
import { suggestQuickReplies } from '@/ai/flows/suggest-quick-replies';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { LoaderCircle, PlusCircle } from 'lucide-react';
import { useChatHistory } from '@/hooks/use-chat-history';
import { Button } from '../ui/button';

export function ChatInterface() {
  const { 
    activeChat, 
    isLoading, 
    addMessage, 
    loadSuggestions,
    updateChatTitle,
    createNewChat,
    chats,
  } = useChatHistory();
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = async (text: string, photoDataUri?: string) => {
    if (!activeChat) return;
    setIsAiLoading(true);

    const userMessageId = Date.now().toString();
    const isFirstUserMessage = activeChat.messages.filter(m => m.role === 'user').length === 0;

    addMessage({ id: userMessageId, role: 'user', text, attachment: photoDataUri });

    try {
      // Fetch AI response
      const aiResponse = await respondToUserQuery({ query: text, photoDataUri });
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        text: aiResponse.text,
        audio: aiResponse.audio,
      };
      addMessage(aiMessage);

      const currentConversation = [...(activeChat?.messages || []), { id: userMessageId, role: 'user' as const, text }, aiMessage];
      const conversationHistory = currentConversation
        .map((msg) => `${msg.role}: ${msg.text}`)
        .join('\n');
      
      // Update title after first user message
      if (isFirstUserMessage) {
        updateChatTitle(conversationHistory);
      }

      // Fetch quick replies
      const replySuggestions = await suggestQuickReplies({ conversationHistory });
      loadSuggestions(replySuggestions.suggestions);

    } catch (error) {
      console.error('Erro com os serviços de IA:', error);
      toast({
        title: 'Ocorreu um erro',
        description: 'Não foi possível obter uma resposta da IA. Por favor, tente novamente.',
        variant: 'destructive',
      });
      // Optional: remove the user's message if the AI fails
      // This part needs more complex state management if we want to undo the addMessage
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickReplyClick = (text: string) => {
    if (!activeChat) return;
    loadSuggestions([]); // Clear suggestions
    handleSendMessage(text);
  };
  
  if (!activeChat) {
    const hasChats = chats && chats.length > 0 && chats.some(c => c.messages.length > 1);
    return (
      <div className="flex flex-col h-full w-full bg-card rounded-lg shadow-lg border items-center justify-center text-muted-foreground gap-4">
        {hasChats && <p>Selecione uma conversa ou inicie uma nova.</p>}
        <Button onClick={createNewChat}>
            Nova Conversa
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-card rounded-lg shadow-lg border">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 sm:p-6 space-y-6">
          {activeChat.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isAiLoading && (
            <div className="flex items-start space-x-3 w-full max-w-xl mr-auto flex-row">
                <div className="rounded-lg bg-muted p-3 text-sm shadow-sm">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-background">
        <QuickReplies
          replies={activeChat.suggestions}
          onReplyClick={handleQuickReplyClick}
          isLoading={isAiLoading || isLoading}
        />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isAiLoading || isLoading} />
      </div>
    </div>
  );
}
