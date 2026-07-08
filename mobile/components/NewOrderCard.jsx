import { View, Text, Pressable } from "react-native";
import { Clock } from "lucide-react-native";
import { recipeById } from "../mock/posOrders";
import { elapsedLabel } from "../utils/format";

export function NewOrderCard({ order, onAccept }) {
  const firstItem = order.items[0];
  const recipe = recipeById(firstItem.recipeId);
  const extraCount = order.items.length - 1;

  return (
    <View className="w-80 bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 mr-3">
      <View className="flex justify-between items-center flex-row">
        <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
          {order.orderNumber} · Table {order.tableNumber}
        </Text>

        <View className="flex-row items-center gap-1 mb-3">
          <Clock size={13} color="#BA1A1A" />
          <Text className="text-xs font-medium text-error">
            {elapsedLabel(order.sentToKitchenAt)}
          </Text>
        </View>
      </View>

      <Text className="text-base font-semibold text-on-surface mb-1">
        {recipe?.name}
        {extraCount > 0 ? ` +${extraCount} more` : ""}
      </Text>
      <Text className="text-sm font-regular text-on-surface-variant mb-4">
        Qty: {firstItem.quantity}
        {order.notes ? ` · ${order.notes}` : ""}
      </Text>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-sm text-primary font-semibold text-on-surface-variant w-1/2">
          {recipe?.sellingPriceCents / 100} ETB
        </Text>
        <Pressable
          onPress={() => onAccept(order.id)}
          className="bg-primary w-1/2 rounded-full py-2.5 items-center active:opacity-90"
        >
          <Text className="text-on-primary font-semibold text-sm">Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}
