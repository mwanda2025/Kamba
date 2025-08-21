
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from '@/components/auth/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-background"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, hsl(var(--accent) / 0.1), transparent), radial-gradient(ellipse 80% 80% at 50% 120%, hsl(var(--ring) / 0.1), transparent)',
        }}
      ></div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <UserNav />
        ) : (
          <Button variant="ghost" asChild>
            <Link href="/login">
              Entrar
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          KAMBA
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground">
          O seu companheiro digital Angolano. <br/> Faça perguntas, obtenha informações e explore com um assistente experiente e amigável.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="group">
            <Link href="/chat">
              Começar a Conversa
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="pt-12 grid gap-4 md:grid-cols-3 w-full max-w-5xl">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Interação por Voz</h3>
                    <p className="text-muted-foreground">Fale naturalmente e receba respostas faladas. Perfeito para uso com as mãos livres.</p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Suporte Multilingue</h3>
                    <p className="text-muted-foreground">Converse em Português ou Inglês. O Kamba entende você.</p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Consciente do Contexto</h3>
                    <p className="text-muted-foreground">Receba respostas rápidas e relevantes com base no fluxo da sua conversa.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
