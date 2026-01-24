import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from '@/components/stoxo/ChatInterface';
import { ResponsePanel } from '@/components/stoxo/ResponsePanel';
import { useStoxoAI, StoxoResponse } from '@/hooks/useStoxoAI';

const StoxoAI = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useStoxoAI();
  const [activeResponse, setActiveResponse] = useState<StoxoResponse | undefined>();

  // Update active response when messages change
  useEffect(() => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage?.response) {
      setActiveResponse(lastAssistantMessage.response);
    }
  }, [messages]);

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-border/50"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Stoxo AI</h1>
              <p className="text-sm text-muted-foreground">AI-powered Stock Research Assistant</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs border-warning/30 text-warning/80">
            <Shield className="h-3 w-3 mr-1" />
            Educational Only
          </Badge>
        </motion.div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[45%] border-r border-border/50 flex flex-col"
          >
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSend={sendMessage}
              onClear={clearMessages}
            />
          </motion.div>

          {/* Response Panel - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex flex-1 flex-col"
          >
            <div className="flex-1 overflow-auto p-6">
              {activeResponse ? (
                <ResponsePanel
                  response={activeResponse}
                  onPromptSelect={handlePromptSelect}
                  isLoading={isLoading}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Analysis Panel
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Ask a question in the chat to see detailed stock analysis, 
                      comparisons, and sector insights here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SEBI Disclaimer */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                <span className="text-warning">⚠️</span> This tool is for educational purposes only. 
                Past performance is not indicative of future results. 
                Consult a SEBI-registered investment advisor before making investment decisions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoxoAI;
