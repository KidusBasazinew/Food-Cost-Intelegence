export const ORDER_STATUS_STYLES = {
  SENT_TO_KITCHEN: {
    label: "New",
    bg: "bg-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  PREPARING: {
    label: "Preparing",
    bg: "bg-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  READY: {
    label: "Ready",
    bg: "bg-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  SERVED: {
    label: "Served",
    bg: "bg-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

// The kitchen's forward-progress chain (chef only advances through these)
export const NEXT_STATUS = {
  SENT_TO_KITCHEN: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

export const NEXT_ACTION_LABEL = {
  SENT_TO_KITCHEN: "Accept",
  PREPARING: "Mark Ready",
  READY: "Mark Served",
};
