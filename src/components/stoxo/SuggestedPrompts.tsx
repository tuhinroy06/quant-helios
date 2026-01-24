import { motion } from 'framer-motion';

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background hover:bg-muted border border-border rounded-full transition-all duration-200 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prompt}
        </motion.button>
      ))}
    </motion.div>
  );
};

export const WelcomePrompts = ({ onSelect }: { onSelect: (prompt: string) => void }) => {
  const welcomePrompts = [
    { text: "Canara Bank vs PNB", emoji: "🏦" },
    { text: "How to plan finances before marriage", emoji: "💍" },
    { text: "Can Policybazaar sustain growth?", emoji: "💻" },
    { text: "Sector funds to bet on in 2025", emoji: "" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {welcomePrompts.map((prompt, index) => (
        <motion.button
          key={prompt.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          onClick={() => onSelect(prompt.text)}
          className="px-4 py-2 text-sm text-foreground bg-background hover:bg-muted border border-border rounded-full transition-all duration-200"
        >
          {prompt.text} {prompt.emoji}
        </motion.button>
      ))}
    </div>
  );
};
