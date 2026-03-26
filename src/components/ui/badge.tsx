import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const variants: Record<string, string> = {
  default: "bg-foreground/10 text-foreground border-foreground/20",
  secondary: "bg-muted text-muted-foreground border-border",
  destructive: "bg-destructive/15 text-destructive border-destructive/25",
  outline: "border border-border text-foreground",
  success: "bg-foreground/8 text-foreground border-foreground/15",
  warning: "bg-foreground/10 text-foreground border-foreground/20",
};

// Numeric score → monochromatic severity (dark card = lower opacity for good, higher for bad)
const scoreVariants: Record<string, string> = {
  success: "border-border bg-muted text-muted-foreground",
  warning: "border-border bg-secondary text-foreground/70",
  destructive: "border-foreground/30 bg-foreground/10 text-foreground font-semibold",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const v = scoreVariants[variant] ?? variants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
        v,
        className
      )}
      {...props}
    />
  );
}
