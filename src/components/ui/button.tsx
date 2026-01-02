"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag"> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            "neumorphic text-slate-800 dark:text-slate-100 hover:neumorphic-glow active:neumorphic-pressed rounded-2xl font-semibold": variant === "default",
            "neumorphic text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:neumorphic-glow active:neumorphic-pressed rounded-2xl font-semibold": variant === "success",
            "neumorphic-inset text-slate-700 dark:text-slate-200 hover:neumorphic active:neumorphic-pressed rounded-2xl": variant === "outline",
            "neumorphic-inset text-slate-600 dark:text-slate-300 hover:neumorphic active:neumorphic-pressed rounded-2xl": variant === "ghost",
            "neumorphic text-white bg-gradient-to-r from-red-500 to-pink-600 hover:neumorphic-glow active:neumorphic-pressed rounded-2xl font-semibold": variant === "destructive",
            "h-10 py-2 px-4": size === "default",
            "h-9 px-3": size === "sm",
            "h-11 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

