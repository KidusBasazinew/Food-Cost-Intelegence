import { Sparkles, Wrench, ClipboardCheck } from "lucide-react-native";

export const TASK_STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    bg: "bg-surface-container-highest",
    text: "text-on-surface-variant",
    dot: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  CLEANED: {
    label: "Cleaned",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  VERIFIED: {
    label: "Verified",
    bg: "bg-primary-container",
    text: "text-on-primary-container",
    dot: "bg-primary",
  },
};

export const TASK_KIND_STYLES = {
  CLEANING: { label: "Cleaning", icon: Sparkles, color: "#4F378A" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, color: "#B45309" },
  INSPECTION: { label: "Inspection", icon: ClipboardCheck, color: "#633B48" },
};

export const NEXT_TASK_STATUS = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "CLEANED",
  CLEANED: "VERIFIED",
};

export const NEXT_TASK_ACTION_LABEL = {
  PENDING: "Start Task",
  IN_PROGRESS: "Mark Done",
  CLEANED: "Verify",
};
