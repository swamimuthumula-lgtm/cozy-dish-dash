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
    <Card className={cn("hover-lift", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm mt-2 flex items-center gap-1",
                trend.isPositive ? "text-income" : "text-expense"
              )}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center text-2xl",
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