import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const variants: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/85",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/85",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
};
const sizes: Record<string, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-7 px-3 text-xs",
  lg: "h-10 px-6",
  icon: "h-8 w-8",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
export { Button };
