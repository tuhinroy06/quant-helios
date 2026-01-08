import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Clock, RotateCcw, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface StrategyVersion {
  id: string;
  version: number;
  created_at: string;
  change_summary: string | null;
  config_snapshot: Json;
}

interface VersionHistoryProps {
  strategyId: string;
  versions: StrategyVersion[];
  currentVersion: number;
  onRestore: (version: StrategyVersion) => void;
  isLoading: boolean;
}

export const VersionHistory = ({
  strategyId,
  versions,
  currentVersion,
  onRestore,
  isLoading,
}: VersionHistoryProps) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-foreground font-medium">Version History</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-foreground font-medium">Version History</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          No previous versions available. Versions are created automatically when you modify the strategy.
        </p>
      </div>
    );
  }

  const formatSnapshot = (snapshot: Json): string => {
    if (typeof snapshot !== 'object' || snapshot === null) return 'No data';
    const s = snapshot as Record<string, Json>;
    const parts = [];
    if (s.entry_rules && Array.isArray(s.entry_rules)) {
      parts.push(`${s.entry_rules.length} entry rules`);
    }
    if (s.exit_rules && Array.isArray(s.exit_rules)) {
      parts.push(`${s.exit_rules.length} exit rules`);
    }
    if (s.timeframe) parts.push(`${s.timeframe} timeframe`);
    return parts.join(', ') || 'Strategy configuration';
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-foreground font-medium">Version History</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {versions.length} versions
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg transition-colors ${
                    version.version === currentVersion
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary/50 hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">
                          v{version.version}
                        </span>
                        {version.version === currentVersion && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {version.change_summary || formatSnapshot(version.config_snapshot)}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedVersion(
                            expandedVersion === version.id ? null : version.id
                          )
                        }
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {expandedVersion === version.id ? "Hide" : "View"} details
                      </button>
                      {version.version !== currentVersion && (
                        <button
                          onClick={() => onRestore(version)}
                          className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedVersion === version.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-border overflow-hidden"
                        >
                          <pre className="text-xs text-muted-foreground bg-background p-3 rounded-lg overflow-x-auto">
                            {JSON.stringify(version.config_snapshot, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
