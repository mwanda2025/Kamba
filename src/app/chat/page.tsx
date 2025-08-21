
'use client';

import ChatLayout from "@/components/chat/chat-layout";
import { UserNav } from "@/components/auth/user-nav";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { user } = useAuth();

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        {user ? <UserNav /> : (
            <Button variant="ghost" asChild>
                <Link href="/login">
                Entrar
                </Link>
            </Button>
        )}
      </div>
      <ChatLayout />
    </main>
  );
}
