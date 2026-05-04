import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center animate-in fade-in duration-500",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated text-text-muted mb-4">
        {icon || <FolderOpen className="h-10 w-10" />}
      </div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-text-secondary max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
