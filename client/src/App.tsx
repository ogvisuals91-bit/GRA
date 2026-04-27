import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Vote from "@/pages/Vote";
import Leaderboard from "@/pages/Leaderboard";
import Sponsorship from "@/pages/Sponsorship";
import VendorSpace from "@/pages/VendorSpace";
import Tickets from "@/pages/Tickets";
import MyTickets from "@/pages/MyTickets";
import UserSignup from "@/pages/UserSignup";
import UserLogin from "@/pages/UserLogin";
import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";

import { AppSidebar } from "./components/layout/AppSidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import trophyImg from "@assets/file_0000000011b071f5b191b2f4a56bb379_1771567014260.png";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/vote" component={Vote} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/sponsorship" component={Sponsorship} />
      <Route path="/vendor" component={VendorSpace} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/my-tickets" component={MyTickets} />
      <Route path="/signup" component={UserSignup} />
      <Route path="/login" component={UserLogin} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full bg-background relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center bg-background">
              <div className="relative sparkle-effect">
                <img 
                  src={trophyImg} 
                  alt="Ghost Award Trophy" 
                  className="w-[80vh] h-[80vh] object-contain opacity-5 animate-rotate-3d mix-blend-screen grayscale brightness-150"
                  style={{ filter: "drop-shadow(0 0 50px rgba(168, 85, 247, 0.2))" }}
                />
              </div>
            </div>

            <div className="relative z-10 flex w-full h-full">
              <div className="hidden md:flex">
                <AppSidebar />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden bg-background/40 backdrop-blur-[2px]">
                <header className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex">
                      <SidebarTrigger data-testid="button-sidebar-toggle" />
                    </div>
                    <h1 className="text-xl font-serif font-bold tracking-tight">GHOST AWARDS</h1>
                  </div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                  <Router />
                </main>
              </div>
            </div>
          </div>

          <BottomNav />
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
