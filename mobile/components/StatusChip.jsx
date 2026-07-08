import { View, Text } from "react-native";
import { ORDER_STATUS_STYLES } from "../utils/orderStatus";

export function StatusChip({ status }) {
  const style = ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.COMPLETED;
  return (
    <View
      className={`flex-row justify-center items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg}`}
    >
      <Text className={`text-xs font-semibold ${style.text}`}>
        {style.label}
      </Text>
    </View>
  );
}
