"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-6 w-full overflow-hidden rounded-full neumorphic-inset",
          className
        )}
        {...props}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };

