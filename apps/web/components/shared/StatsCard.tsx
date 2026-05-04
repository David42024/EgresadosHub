import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card variant="elevated" className={cn("overflow-hidden group", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight text-text-primary font-mono">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend.isUp ? "bg-success/10 text-success" : "bg-error/10 text-error"
              )}>
                {trend.isUp ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-text-muted font-medium">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
