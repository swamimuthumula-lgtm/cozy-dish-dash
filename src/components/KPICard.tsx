import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
  className?: string;
}

const KPICard = ({ title, value, icon, trend, gradient, className }: KPICardProps) => {
  return (
    <Card className={cn("hover-lift transition-smooth", className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 md:space-y-2 min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground truncate">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs md:text-sm flex items-center gap-1",
                trend.isPositive ? "text-income" : "text-expense"
              )}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 ml-2",
            gradient || "bg-secondary"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;