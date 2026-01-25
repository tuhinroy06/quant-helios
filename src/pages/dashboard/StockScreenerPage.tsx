import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdvancedScreener } from "@/components/screener";

const StockScreenerPage = () => {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)]">
        <AdvancedScreener />
      </div>
    </DashboardLayout>
  );
};

export default StockScreenerPage;
