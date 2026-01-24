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
  Building2,
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

const menuItems = [
  { title: "Dashboard", url: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Strategies", url: "/dashboard/strategies", icon: FolderOpen },
  { title: "Performance", url: "/dashboard/performance", icon: PieChart },
  { title: "Paper Trading", url: "/dashboard/paper-trading", icon: Wallet },
  { title: "Stock Screener", url: "/dashboard/screener", icon: SlidersHorizontal },
  { title: "Trade Journal", url: "/dashboard/journal", icon: BookOpen },
  { title: "F&O Simulator", url: "/dashboard/fno", icon: BarChart3 },
  { title: "Helios AI", url: "/dashboard/stoxo-ai", icon: Sparkles },
  { title: "Live Trading", url: "/dashboard/live-trading", icon: Zap },
  { title: "Organization", url: "/dashboard/organization", icon: Building2 },
  { title: "Learn", url: "/dashboard/learn", icon: GraduationCap },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
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
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-label text-muted-foreground mb-2`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && user && (
          <div className="text-xs text-muted-foreground mb-3 truncate px-1">
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
