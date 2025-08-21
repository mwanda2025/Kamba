
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';

// A simple ID generator to avoid external libraries
const mockV4 = () => {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audio?: string;
  attachment?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  suggestions: string[];
}

interface ChatHistoryContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  createNewChat: () => void;
  switchChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (message: Omit<Message, 'id'> & { id?: string }) => void;
  loadSuggestions: (suggestions: string[]) => void;
  updateChatTitle: (conversationHistory: string) => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

const initialMessage: Message = {
    id: 'initial',
    role: 'assistant',
    text: "Olá! Eu sou o **Kamba**, o teu amigo digital angolano!\n\nComo posso ajudar-te hoje?",
};

export const ChatHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('chatHistory');
      const savedActiveId = localStorage.getItem('activeChatId');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        if(savedActiveId) {
            setActiveChatId(JSON.parse(savedActiveId));
        } else if (parsedChats.length > 0) {
            setActiveChatId(parsedChats[0].id);
        }
      } else {
        createNewChat(false);
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      if(chats.length === 0) createNewChat(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(chats));
        if (activeChatId) {
            localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
        } else {
            localStorage.removeItem('activeChatId');
        }
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  }, [chats, activeChatId, isLoading]);

  const createNewChat = useCallback((switchAfterCreation = true) => {
    setChats(prevChats => {
      const activeChat = prevChats.find(c => c.id === activeChatId);

      // If the active chat is already a new/empty chat, don't create another one
      if (activeChat && activeChat.messages.length === 1 && activeChat.messages[0].id === 'initial') {
        if(switchAfterCreation) setActiveChatId(activeChat.id); // Ensure it's active
        return prevChats;
      }
      
      const newChat: Chat = {
        id: mockV4(),
        title: 'Nova Conversa',
        messages: [initialMessage],
        suggestions: [],
      };
      
      if (switchAfterCreation) {
          setActiveChatId(newChat.id);
      }

      return [newChat, ...prevChats];
    });
  }, [activeChatId]);


  const switchChat = (id: string) => {
    setActiveChatId(id);
  };

  const deleteChat = (id: string) => {
    setChats(prevChats => {
      const newChats = prevChats.filter(chat => chat.id !== id);
      if (activeChatId === id) {
        if (newChats.length > 0) {
          setActiveChatId(newChats[0].id);
        } else {
          setActiveChatId(null);
          // We call the function directly to create a new chat without switching to it immediately
          const newChat: Chat = {
              id: mockV4(),
              title: 'Nova Conversa',
              messages: [initialMessage],
              suggestions: [],
          };
          return [newChat];
        }
      }
      return newChats;
    });
  };
  

  const addMessage = (message: Omit<Message, 'id'> & { id?: string }) => {
    if (!activeChatId) return;
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { ...message, id: message.id || mockV4() }],
            suggestions: [],
          };
        }
        return chat;
      })
    );
  };
  
  const loadSuggestions = (suggestions: string[]) => {
    if (!activeChatId) return;
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId ? { ...chat, suggestions } : chat
      )
    );
  };

  const updateChatTitle = useCallback(async (conversationHistory: string) => {
    if (!activeChatId) return;
    try {
      const { title } = await generateChatTitle({ conversationHistory });
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChatId ? { ...chat, title } : chat
        )
      );
    } catch (error) {
      console.error("Failed to generate chat title:", error);
    }
  }, [activeChatId]);

  const activeChat = chats.find(chat => chat.id === activeChatId) || null;

  return (
    <ChatHistoryContext.Provider
      value={{ chats, activeChat, isLoading, createNewChat, switchChat, deleteChat, addMessage, loadSuggestions, updateChatTitle }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
