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
    <Card className={cn("hover-lift border-0", className)}>
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 md:space-y-2.5 min-w-0 flex-1">
            <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight tabular-nums">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs md:text-sm flex items-center gap-1.5 font-medium",
                trend.isPositive ? "text-income" : "text-expense"
              )}>
                <span className="text-base">{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 shadow-lg",
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
