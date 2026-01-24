import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  variant?: 'default' | 'welcome';
}

export const ChatInput = ({ 
  onSend, 
  isLoading, 
  placeholder,
  variant = 'default' 
}: ChatInputProps) => {
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

  const isWelcome = variant === 'welcome';

  return (
    <div className="relative">
      <div className={cn(
        "flex items-center gap-2 border rounded-full transition-all",
        isWelcome 
          ? "p-2 pl-5 bg-background border-border shadow-lg" 
          : "p-2 pl-4 bg-card/50 backdrop-blur-sm border-border/30"
      )}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask about a stock, sector, or idea..."}
          className={cn(
            "flex-1 min-h-[24px] max-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 py-1 px-0",
            isWelcome ? "text-base" : "text-sm"
          )}
          disabled={isLoading}
          maxLength={500}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className={cn(
            "shrink-0 rounded-full transition-all",
            isWelcome 
              ? "h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white" 
              : "h-8 w-8",
            input.trim() && !isLoading && !isWelcome
              ? "bg-primary text-primary-foreground"
              : !isWelcome && "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
