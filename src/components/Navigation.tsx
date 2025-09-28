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
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
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
        "w-64 p-6",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">
            🍴
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dish Dash</h1>
            <p className="text-sm text-muted-foreground">Restaurant Manager</p>
          </div>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth hover-lift",
                isActive(item.href) 
                  ? "bg-primary text-primary-foreground shadow-warm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-warm rounded-xl p-4 text-center">
            <p className="text-sm text-white/90 font-medium">Made with ❤️</p>
            <p className="text-xs text-white/75">for food enthusiasts</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;