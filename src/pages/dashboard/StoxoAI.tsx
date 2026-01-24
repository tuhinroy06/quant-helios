import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, PanelLeftClose, PanelLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/stoxo/ChatInterface';
import { ResponsePanel } from '@/components/stoxo/ResponsePanel';
import { ConversationSidebar, Conversation } from '@/components/stoxo/ConversationSidebar';
import { useStoxoAI, StoxoResponse } from '@/hooks/useStoxoAI';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const StoxoAI = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversations,
    activeConversationId,
    isLoadingConversations,
    loadConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
  } = useStoxoAI();
  
  const [activeResponse, setActiveResponse] = useState<StoxoResponse | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  // Transform conversations for sidebar
  const sidebarConversations: Conversation[] = conversations.map(c => ({
    id: c.id,
    title: c.title,
    lastMessageAt: c.lastMessageAt,
    messageCount: c.messageCount,
  }));

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

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    setMobileSheetOpen(false);
  };

  const handleNewChat = () => {
    createNewConversation();
    setMobileSheetOpen(false);
  };

  const SidebarContent = (
    <ConversationSidebar
      conversations={sidebarConversations}
      activeConversationId={activeConversationId}
      onSelect={handleSelectConversation}
      onNew={handleNewChat}
      onDelete={deleteConversation}
      onRename={renameConversation}
      isLoading={isLoadingConversations}
    />
  );

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 lg:p-6 border-b border-border/50"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile menu button */}
            {isMobile ? (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  {SidebarContent}
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </Button>
            )}
            
            <div className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-display font-bold text-foreground">Stoxo AI</h1>
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">AI-powered Stock Research Assistant</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs border-warning/30 text-warning/80">
            <Shield className="h-3 w-3 mr-1" />
            Educational Only
          </Badge>
        </motion.div>

        {/* Main Content - Three-Column Layout on Desktop */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation Sidebar - Desktop Only */}
          {!isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 256 }}
              exit={{ opacity: 0, width: 0 }}
              className="hidden lg:block w-64 shrink-0"
            >
              {SidebarContent}
            </motion.div>
          )}

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[40%] lg:min-w-[350px] border-r border-border/50 flex flex-col"
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
