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
}

export const ChatInterface = ({ messages, isLoading, onSend, onClear }: ChatInterfaceProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Stoxo AI</h2>
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
            Clear
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {!hasMessages ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-4">
                <Sparkles className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Stoxo AI
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your AI-powered research assistant for the Indian stock market. 
                Ask me about stocks, sectors, or market trends.
              </p>
            </div>

            {/* Welcome Prompts */}
            <WelcomePrompts onSelect={onSend} />

            {/* Disclaimer */}
            <div className="mt-8 p-3 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-xs text-warning/80 text-center">
                ⚠️ For educational purposes only. Not financial advice. SEBI registered advisors should be consulted for investment decisions.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50">
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};
