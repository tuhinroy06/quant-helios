import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomePrompts } from './SuggestedPrompts';
import { ChatMessage as ChatMessageType } from '@/hooks/useStoxoAI';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClear: () => void;
  variant?: 'welcome' | 'chat';
}

export const ChatInterface = ({ 
  messages, 
  isLoading, 
  onSend, 
  onClear,
  variant = 'chat'
}: ChatInterfaceProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  // Welcome variant - centered input with suggestions below
  if (variant === 'welcome') {
    return (
      <div className="w-full space-y-6">
        <ChatInput onSend={onSend} isLoading={isLoading} variant="welcome" />
        <WelcomePrompts onSelect={onSend} />
      </div>
    );
  }

  // Chat variant - full chat interface
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Helios AI</h2>
            <p className="text-xs text-muted-foreground">AI Stock Research Assistant</p>
          </div>
        </div>
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};
