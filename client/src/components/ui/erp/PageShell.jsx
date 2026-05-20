import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}

export function KpiGrid({ children, className, cols = 4 }) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4", colClass[cols] || colClass[4], className)}>
      {children}
    </div>
  );
}

export function ContentGrid({ children, className, cols = 2 }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "lg:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
