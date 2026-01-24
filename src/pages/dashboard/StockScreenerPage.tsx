import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StockScreener } from "@/components/paper-trading/StockScreener";
import { PriceChart } from "@/components/paper-trading/PriceChart";
import { QuickTradePanel } from "@/components/paper-trading/QuickTradePanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

const StockScreenerPage = () => {
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(1000000);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!user) return;

      let { data: accountData, error: accountError } = await supabase
        .from("paper_accounts")
        .select("id, current_balance")
        .eq("user_id", user.id)
        .single();

      if (accountError && accountError.code === "PGRST116") {
        // Create account if not exists
        const { data: newAccount, error: createError } = await supabase
          .from("paper_accounts")
          .insert({
            user_id: user.id,
            name: "Default Account",
            initial_balance: 1000000,
            current_balance: 1000000,
            currency: "INR",
          })
          .select()
          .single();

        if (createError) {
          toast.error("Failed to create paper account");
          return;
        }
        accountData = newAccount;
      }

      if (accountData) {
        setAccountId(accountData.id);
        setCurrentBalance(accountData.current_balance);
      }
    };

    fetchAccount();
  }, [user]);

  const handleTradeComplete = async () => {
    // Refresh balance
    if (accountId) {
      const { data } = await supabase
        .from("paper_accounts")
        .select("current_balance")
        .eq("id", accountId)
        .single();
      if (data) {
        setCurrentBalance(data.current_balance);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Screener</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Filter and discover stocks by sector, market cap, price, and technical indicators
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Screener - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <StockScreener
              onSymbolSelect={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </div>

          {/* Right Sidebar - Chart & Trade Panel */}
          <div className="space-y-4">
            {/* Price Chart */}
            <motion.div
              key={selectedSymbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PriceChart symbol={selectedSymbol} />
            </motion.div>

            {/* Quick Trade Panel */}
            {accountId && (
              <QuickTradePanel
                symbol={selectedSymbol}
                accountId={accountId}
                currentBalance={currentBalance}
                onTradeComplete={handleTradeComplete}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockScreenerPage;
