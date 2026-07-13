import { View, Text } from "react-native";

const RESERVATION_STATUS_STYLES = {
  RESERVED: {
    label: "Reserved",
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
    dot: "bg-secondary",
  },
  CHECKED_IN: {
    label: "Checked In",
    bg: "bg-primary-container",
    text: "text-on-primary-container",
    dot: "bg-primary",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    bg: "bg-surface-container-highest",
    text: "text-on-surface-variant",
    dot: "bg-gray-400",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-error-container",
    text: "text-on-error-container",
    dot: "bg-error",
  },
};

export function ReservationStatusChip({ status }) {
  const style =
    RESERVATION_STATUS_STYLES[status] ?? RESERVATION_STATUS_STYLES.CHECKED_OUT;
  return (
    <View
      className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg}`}
    >
      <Text className={`font-semibold text-xs ${style.text}`}>
        {style.label}
      </Text>
    </View>
  );
}
