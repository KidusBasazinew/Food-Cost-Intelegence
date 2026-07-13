export const ROOM_STATUS_STYLES = {
  VACANT: {
    label: "Vacant",
    bg: "bg-surface-container-highest",
    text: "text-on-surface-variant",
    dot: "bg-gray-400",
  },
  OCCUPIED: {
    label: "Occupied",
    bg: "bg-primary-container",
    text: "text-on-primary-container",
    dot: "bg-primary",
  },
  DIRTY: {
    label: "Dirty",
    bg: "bg-error-container",
    text: "text-on-error-container",
    dot: "bg-error",
  },
  CLEANING: {
    label: "Cleaning",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  INSPECTING: {
    label: "Inspecting",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed",
    dot: "bg-tertiary",
  },
  READY: {
    label: "Ready",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    bg: "bg-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-500",
  },
};
