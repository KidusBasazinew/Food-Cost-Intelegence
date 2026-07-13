import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useUnreadCount } from "../hooks/useUnreadCount";
import { NotificationCenterPanel } from "./NotificationCenterPanel";

export function NotificationBell({ className }) {
  const navigate = useNavigate();
  const unread = useUnreadCount();

  const [open, setOpen] = useState(false);

  const count = unread.data?.count ?? 0;
  const critical = unread.data?.criticalCount ?? 0;

  const badgeText = useMemo(() => {
    if (!count) return null;
    if (count > 99) return "99+";
    return String(count);
  }, [count]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className={cn(
          "relative hidden rounded-xl bg-card p-2.5 hover:bg-accent sm:inline-flex",
          className,
        )}
        aria-label="Notifications"
        onClick={() => setOpen(true)}
      >
        <motion.span
          animate={
            critical > 0
              ? {
                  rotate: [0, -12, 12, -8, 8, 0],
                }
              : {}
          }
          transition={{ duration: 0.6, repeat: critical > 0 ? 1 : 0 }}
          className="inline-flex"
        >
          <Bell className="h-4 w-4" />
        </motion.span>

        {badgeText ? (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1",
              critical > 0 ? "bg-rose-600" : "bg-rose-500",
              "text-[10px] font-bold text-white",
            )}
          >
            {badgeText}
          </motion.span>
        ) : null}
      </button>

      <DialogContent
        className={cn(
          "left-auto right-0 top-0 h-dvh w-96 max-w-[92vw]",
          "translate-x-0 translate-y-0 rounded-l-2xl rounded-r-none",
        )}
      >
        <NotificationCenterPanel
          onViewAll={() => {
            setOpen(false);
            navigate("/notifications");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
