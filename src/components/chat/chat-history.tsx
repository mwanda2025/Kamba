
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useChatHistory } from '@/hooks/use-chat-history';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from '../auth/user-nav';
import { ThemeToggle } from '../theme-toggle';

export function ChatHistory() {
  const { chats, activeChat, createNewChat, switchChat, deleteChat } = useChatHistory();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <Button variant="outline" className="w-full justify-start" onClick={createNewChat}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton 
                isActive={activeChat?.id === chat.id} 
                onClick={() => switchChat(chat.id)}
                className="justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare />
                  <span className="truncate">{chat.title}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente o seu histórico de conversas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteChat(chat.id)}>Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
            {user ? <UserNav /> : <div></div>}
            <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
