import { 
  LayoutDashboard, 
  FolderOpen, 
  Wallet, 
  BarChart3, 
  GraduationCap, 
  Settings, 
  LogOut,
  Sparkles,
  Zap,
  BookOpen,
  PieChart,
  SlidersHorizontal
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const tradingItems = [
  { title: "Dashboard", url: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Paper Trading", url: "/dashboard/paper-trading", icon: Wallet },
  { title: "Live Trading", url: "/dashboard/live-trading", icon: Zap },
  { title: "Trade Journal", url: "/dashboard/journal", icon: BookOpen },
];

const strategyItems = [
  { title: "Strategies", url: "/dashboard/strategies", icon: FolderOpen },
  { title: "Performance", url: "/dashboard/performance", icon: PieChart },
  { title: "F&O Simulator", url: "/dashboard/fno", icon: BarChart3 },
];

const toolsItems = [
  { title: "Stock Screener", url: "/dashboard/screener", icon: SlidersHorizontal },
  { title: "Helios AI", url: "/dashboard/stoxo-ai", icon: Sparkles },
  { title: "Learn", url: "/dashboard/learn", icon: GraduationCap },
];

const groups = [
  { label: "Trading", items: tradingItems },
  { label: "Strategies", items: strategyItems },
  { label: "Tools", items: toolsItems },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warm-500 flex items-center justify-center flex-shrink-0">
            <span className="text-background font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="font-display text-lg text-sidebar-foreground">
              AlgoTrade
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-label text-muted-foreground mb-2`}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard/overview"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
                        activeClassName="bg-sidebar-accent text-foreground border-l-2 border-warm-500"
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
                activeClassName="bg-sidebar-accent text-foreground border-l-2 border-warm-500"
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && user && (
          <div className="text-xs text-muted-foreground mt-3 mb-1 truncate px-1">
            {user.email}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
