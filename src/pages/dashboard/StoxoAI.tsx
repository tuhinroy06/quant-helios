import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, Calendar as CalendarIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/stoxo/ChatInterface';
import { ResponsePanel } from '@/components/stoxo/ResponsePanel';
import { ConversationSidebar, Conversation } from '@/components/stoxo/ConversationSidebar';
import { useStoxoAI, StoxoResponse } from '@/hooks/useStoxoAI';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setDatePopoverOpen(false);
    if (date) {
      // Send a query about market on selected date
      sendMessage(`What was the market performance on ${format(date, 'MMMM d, yyyy')}?`);
    }
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

  // Market summary stats (can be fetched from API)
  const marketStats = [
    { label: 'NIFTY 50', value: '24,250', change: '+1.2%', positive: true },
    { label: 'SENSEX', value: '79,820', change: '+0.95%', positive: true },
    { label: 'BANK NIFTY', value: '52,150', change: '-0.3%', positive: false },
  ];

  return (
    <DashboardLayout>
      <div className="h-full flex">
        {/* Left Sidebar - Desktop */}
        {!isMobile && (
          <div className="w-72 shrink-0 border-r border-border/30 bg-card/30">
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-lg">Helios AI</span>
                  <p className="text-xs text-muted-foreground">AI Stock Research</p>
                </div>
              </div>
            </div>
            
            {/* Date Picker Section */}
            <div className="p-4 border-b border-border/30">
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Market Summary */}
            <div className="p-4 border-b border-border/30">
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Market Summary</h3>
              <div className="space-y-2">
                {marketStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{stat.value}</span>
                      <span className={cn(
                        "text-xs flex items-center gap-0.5",
                        stat.positive ? "text-primary" : "text-destructive"
                      )}>
                        {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
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
            <SheetContent side="left" className="p-0 w-80">
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-foreground">Helios AI</span>
                </div>
              </div>
              
              {/* Mobile Date Picker */}
              <div className="p-4 border-b border-border/30">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2020-01-01")
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
                {/* Animated Logo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 mb-6"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 leading-tight"
                >
                  Welcome to Helios AI
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-8 text-lg"
                >
                  Your AI-powered assistant for Indian stock market research and analysis
                </motion.p>
                
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
              <div className="hidden lg:flex flex-1 flex-col bg-gradient-to-b from-card/50 to-background">
                <div className="flex-1 overflow-auto p-6">
                  <AnimatePresence mode="wait">
                    {activeResponse ? (
                      <ResponsePanel
                        response={activeResponse}
                        onPromptSelect={handlePromptSelect}
                        isLoading={isLoading}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex items-center justify-center"
                      >
                        <div className="text-center max-w-md">
                          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 mb-4">
                            <Sparkles className="h-8 w-8 text-amber-500/50" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Analysis Panel
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Your detailed stock analysis, comparisons, and insights will appear here.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtle Footer */}
                <div className="p-3 text-center border-t border-border/30">
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
