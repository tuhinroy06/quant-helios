import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface Conversation {
  id: string;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  isLoading?: boolean;
}

const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; conversations: Conversation[] }[] = [
    { label: 'Today', conversations: [] },
    { label: 'Yesterday', conversations: [] },
    { label: 'Last 7 Days', conversations: [] },
    { label: 'Older', conversations: [] },
  ];

  conversations.forEach(conv => {
    const msgDate = new Date(conv.lastMessageAt);
    if (msgDate >= today) {
      groups[0].conversations.push(conv);
    } else if (msgDate >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (msgDate >= lastWeek) {
      groups[2].conversations.push(conv);
    } else {
      groups[3].conversations.push(conv);
    }
  });

  return groups.filter(g => g.conversations.length > 0);
};

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isLoading,
}: ConversationSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedConversations = groupConversationsByDate(conversations);

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <Button
          onClick={onNew}
          variant="ghost"
          className="w-full justify-start gap-2 text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Start a New Thread
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to begin researching
              </p>
            </div>
          ) : (
            groupedConversations.map(group => (
              <div key={group.label}>
                <h4 className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {group.label}
                </h4>
                <div className="space-y-1">
                  <AnimatePresence>
                    {group.conversations.map(conv => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="group relative"
                      >
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-1 p-1">
                            <Input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="h-8 text-xs"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : deletingId === conv.id ? (
                          <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/30">
                            <p className="text-xs text-destructive mb-2">Delete this conversation?</p>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs flex-1"
                                onClick={() => handleDelete(conv.id)}
                              >
                                Delete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs flex-1"
                                onClick={() => setDeletingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                              'w-full text-left p-2 rounded-lg transition-colors',
                              'hover:bg-muted/50',
                              activeConversationId === conv.id && 'bg-primary/10 border border-primary/30'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{conv.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleStartEdit(conv);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setDeletingId(conv.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
