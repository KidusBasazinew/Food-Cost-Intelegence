import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        {badge ? (
          <div className="mb-2">{badge}</div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </motion.div>
  );
}
