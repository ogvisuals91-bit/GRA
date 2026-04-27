import { Home, List, Trophy, Vote, Lock, LayoutDashboard, LogOut, Handshake, ShoppingBag, Ticket } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const publicItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Categories", url: "/categories", icon: List },
  { title: "Vote", url: "/vote", icon: Vote },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Vendor Space", url: "/vendor", icon: ShoppingBag },
  { title: "Sponsorship", url: "/sponsorship", icon: Handshake },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">GHOST</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} className="h-12 rounded-xl">
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-bold uppercase tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/admin/login" || location === "/admin/dashboard"} className="h-12 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
                  <Link href={user?.loggedIn ? "/admin/dashboard" : "/admin/login"} className="flex items-center gap-3 text-primary font-bold">
                    <Lock className="w-5 h-5" />
                    <span className="uppercase tracking-widest">Admin Portal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.loggedIn && (
          <SidebarGroup className="animate-in fade-in slide-in-from-left-2 duration-500">
            <SidebarGroupLabel className="text-primary font-bold uppercase tracking-widest text-[10px] opacity-70">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin/dashboard"} className="h-12 rounded-xl">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="font-bold">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        {user?.loggedIn && (
          <div className="flex flex-col gap-2">
            <div className="px-2 py-1.5 text-sm text-muted-foreground truncate font-medium">
              Logged in as Admin
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-3 w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10"
              onClick={() => { logout(); window.location.href = "/"; }}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold uppercase tracking-tight text-xs">Sign Out</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
