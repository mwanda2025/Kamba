'use client';

import type { FormEvent } from 'react';
import * as React from 'react';
import { Mic, Paperclip, SendHorizonal, LoaderCircle, MessageSquare, Square, XCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [attachment, setAttachment] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recognitionRef = React.useRef<any>(null);
  const [isRecording, setIsRecording] = React.useState(false);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !attachment) || isLoading) return;
    onSendMessage(inputValue, attachment);
    setInputValue('');
    setAttachment(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({
            title: "Funcionalidade não suportada",
            description: "O reconhecimento de voz não é suportado neste navegador.",
            variant: "destructive",
        });
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        setIsRecording(true);
        toast({
            title: "A ouvir...",
            description: "Pode começar a falar.",
        });
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognition.onerror = (event) => {
        setIsRecording(false);
        let errorMessage = "Ocorreu um erro durante o reconhecimento de voz.";
        if (event.error === 'no-speech') {
            errorMessage = "Nenhuma fala foi detectada. Tente novamente.";
        } else if (event.error === 'audio-capture') {
            errorMessage = "Falha ao capturar áudio. Verifique as permissões do microfone.";
        } else if (event.error === 'not-allowed') {
            errorMessage = "Permissão para usar o microfone foi negada.";
        }
        toast({
            title: "Erro",
            description: errorMessage,
            variant: "destructive",
        });
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setInputValue(inputValue + finalTranscript + interimTranscript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  
  const handleAttachmentClick = () => {
     fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "Ficheiro muito grande",
          description: "Por favor, selecione um ficheiro com menos de 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  React.useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);


  return (
    <div className="w-full p-4 bg-background border-t">
      {attachment && (
        <div className="mb-2 p-2 border rounded-lg relative bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <span>Imagem anexada</span>
            </div>
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={removeAttachment}>
                <XCircle className="h-4 w-4" />
            </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-start gap-4">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Escreva aqui a sua mensagem..."
            className="flex-1 resize-none max-h-36 pl-10"
            rows={1}
            disabled={isLoading}
            aria-label="Entrada de chat"
          />
           <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
          />
        </div>
        <div className="flex items-center gap-2">
            <Button type="button" variant={isRecording ? "destructive" : "ghost"} size="icon" onClick={handleVoiceClick} aria-label="Usar microfone" disabled={isLoading}>
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleAttachmentClick} aria-label="Anexar ficheiro" disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
            </Button>
            <Button type="submit" size="icon" aria-label="Enviar mensagem" disabled={isLoading || (!inputValue.trim() && !attachment)}>
              {isLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
            </Button>
        </div>
      </form>
    </div>
  );
}
