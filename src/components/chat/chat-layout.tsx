
'use client';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChatHistory } from './chat-history';
import { ChatInterface } from './chat-interface';
import { Card, CardHeader } from '../ui/card';
import { ChatHistoryProvider } from '@/hooks/use-chat-history';

export default function ChatLayout() {
  return (
    <ChatHistoryProvider>
      <SidebarProvider>
        <ChatHistory />
        <SidebarInset className="p-2 md:p-4 max-h-screen">
          <Card className="h-full w-full flex flex-col shadow-none border-none">
            <CardHeader className="p-2 md:p-4 border-b">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <div>
                      <h2 className="text-xl font-semibold">Kamba</h2>
                      <p className="text-sm text-muted-foreground">Assistente Virtual Angolano</p>
                  </div>
                </div>
            </CardHeader>
            <ChatInterface />
          </Card>
        </SidebarInset>
      </SidebarProvider>
    </ChatHistoryProvider>
  );
}
