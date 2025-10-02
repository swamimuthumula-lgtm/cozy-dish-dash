import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  UtensilsCrossed, 
  TrendingUp, 
  FileBarChart, 
  Menu as MenuIcon,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
        "fixed left-0 top-0 h-full bg-card border-r border-border shadow-soft z-40 transition-transform duration-300",
        "w-72 md:w-64 p-4 md:p-6",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-8 pt-2">
          <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center text-2xl shadow-md">
            🍴
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dish Dash</h1>
            <p className="text-xs text-muted-foreground">Restaurant Manager</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-smooth",
                isActive(item.href) 
                  ? "bg-primary text-primary-foreground shadow-warm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-warm rounded-xl p-3 text-center shadow-md">
            <p className="text-sm text-white/90 font-medium">Made with ❤️</p>
            <p className="text-xs text-white/75">for food enthusiasts</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;