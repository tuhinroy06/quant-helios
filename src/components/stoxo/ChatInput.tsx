import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-2 p-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about any Indian stock, sector, or market trends..."}
            className="min-h-[44px] max-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 py-3 px-1"
            disabled={isLoading}
            maxLength={500}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-xl shrink-0 transition-all duration-200",
            input.trim() && !isLoading
              ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-muted-foreground/50">
          Press Enter to send, Shift + Enter for new line
        </span>
        <span className="text-xs text-muted-foreground/50">
          {input.length}/500
        </span>
      </div>
    </div>
  );
};
