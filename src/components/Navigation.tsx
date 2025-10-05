import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  UtensilsCrossed, 
  TrendingUp, 
  FileBarChart, 
  Menu as MenuIcon,
  X,
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home, emoji: "🏠" },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed, emoji: "🍽️" },
    { href: "/transactions", label: "Transactions", icon: TrendingUp, emoji: "💸" },
    { href: "/reports", label: "Reports", icon: FileBarChart, emoji: "📊" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden bg-card shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Navigation sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full glass border-r border-border/50 backdrop-blur-xl z-40 transition-all duration-300",
        "w-72 md:w-72 p-5 md:p-6",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-10 pt-3">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-3xl shadow-primary">
            🍴
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dish Dash</h1>
            <p className="text-xs text-muted-foreground font-medium">Modern Restaurant Manager</p>
            {isAdmin && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 group",
                isActive(item.href) 
                  ? "bg-gradient-primary text-primary-foreground shadow-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <span className="text-2xl transition-transform group-hover:scale-110">{item.emoji}</span>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-5 right-5 space-y-3">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                variant="default"
                size="sm"
                className="w-full"
              >
                Admin Login
              </Button>
            </Link>
          )}
          <div className="bg-gradient-primary rounded-2xl p-4 text-center shadow-primary">
            <p className="text-sm text-white font-semibold">Made with ❤️</p>
            <p className="text-xs text-white/80">for food enthusiasts</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;