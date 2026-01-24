import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  isLoading?: boolean;
}

export const SuggestedPrompts = ({ prompts, onSelect, isLoading }: SuggestedPromptsProps) => {
  if (!prompts.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
          onClick={() => !isLoading && onSelect(prompt)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card/50 hover:bg-card border border-border/50 hover:border-violet-500/30 rounded-full transition-all duration-200 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-3 w-3 text-violet-400" />
          {prompt}
        </motion.button>
      ))}
    </motion.div>
  );
};

export const WelcomePrompts = ({ onSelect }: { onSelect: (prompt: string) => void }) => {
  const welcomePrompts = [
    "Top 5 IT stocks with high momentum",
    "Compare TCS vs Infosys vs Wipro",
    "Best banking stocks for long term",
    "Which FMCG stocks are undervalued?",
    "Show me Nifty 50 leaders today",
    "Analyze Reliance Industries",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span>Try asking:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {welcomePrompts.map((prompt, index) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onSelect(prompt)}
            className="text-left px-4 py-3 text-sm text-muted-foreground bg-card/30 hover:bg-card/60 border border-border/30 hover:border-violet-500/30 rounded-xl transition-all duration-200 hover:text-foreground group"
          >
            <span className="group-hover:text-violet-400 transition-colors">→</span>{' '}
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
