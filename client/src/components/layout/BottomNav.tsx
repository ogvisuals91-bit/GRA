import { Link, useLocation } from "wouter";
import { Home, Vote, Trophy, Handshake, Lock, Ticket } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Vote", href: "/vote", icon: Vote },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Leaders", href: "/leaderboard", icon: Trophy },
  { label: "Sponsor", href: "/sponsorship", icon: Handshake },
  { label: "Admin", href: "/admin/login", icon: Lock },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 safe-area-pb"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[44px] ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/15" : ""}`}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              </div>
              <span className={`text-[9px] font-bold tracking-wider uppercase transition-all duration-200 ${isActive ? "opacity-100" : "opacity-60"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
