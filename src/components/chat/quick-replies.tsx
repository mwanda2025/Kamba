'use client';

import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  replies: string[];
  onReplyClick: (text: string) => void;
  isLoading: boolean;
}

export function QuickReplies({ replies, onReplyClick, isLoading }: QuickRepliesProps) {
  if (replies.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground mr-2">Sugestões:</p>
        {replies.map((reply, index) => (
            <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReplyClick(reply)}
            className="rounded-full"
            >
            {reply}
            </Button>
        ))}
        </div>
    </div>
  );
}
