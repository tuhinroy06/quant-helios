import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/stoxo/ChatInterface';
import { ResponsePanel } from '@/components/stoxo/ResponsePanel';
import { ConversationSidebar, Conversation } from '@/components/stoxo/ConversationSidebar';
import { useStoxoAI, StoxoResponse } from '@/hooks/useStoxoAI';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

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
    } else {
      setActiveResponse(undefined);
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

  const hasMessages = messages.length > 0;

  return (
    <DashboardLayout>
      <div className="h-full flex">
        {/* Left Sidebar - Desktop */}
        {!isMobile && (
          <div className="w-64 shrink-0 border-r border-border/30">
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">Helios AI</span>
              </div>
            </div>
            {SidebarContent}
          </div>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="fixed top-4 left-4 z-50 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-foreground">Helios AI</span>
                </div>
              </div>
              {SidebarContent}
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            /* Welcome State - Centered Layout */
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl text-center"
              >
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8 leading-tight">
                  Got a question about markets,<br />
                  stocks or mutual funds?
                </h1>
                
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSend={sendMessage}
                  onClear={clearMessages}
                  variant="welcome"
                />
              </motion.div>

              {/* Subtle Footer */}
              <p className="absolute bottom-6 text-xs text-muted-foreground/60">
                To err is human, I am just an AI
              </p>
            </div>
          ) : (
            /* Chat State - Split Layout */
            <div className="flex-1 flex overflow-hidden">
              {/* Chat Panel */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full lg:w-[45%] lg:min-w-[400px] flex flex-col border-r border-border/30"
              >
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSend={sendMessage}
                  onClear={clearMessages}
                  variant="chat"
                />
              </motion.div>

              {/* Response Panel - Desktop Only */}
              <div className="hidden lg:flex flex-1 flex-col">
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
                          Your detailed stock analysis and insights will appear here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtle Footer */}
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground/60">
                    To err is human, I am just an AI
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoxoAI;
