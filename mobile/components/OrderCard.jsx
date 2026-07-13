import { View, Text, Pressable } from "react-native";
import { Clock, Users } from "lucide-react-native";
import { StatusChip } from "./StatusChip";
import { recipeById } from "../mock/posOrders";
import { elapsedLabel } from "../utils/format";
import { NEXT_ACTION_LABEL } from "../utils/orderStatus";

export function OrderCard({ order, onAdvance }) {
  return (
    <View className="bg-surface-container-low rounded-xl p-4 mb-3 border border-outline-variant">
      <View className="flex-row items-start justify-between mb-3">
        <View>
          <Text className="text-base font-semibold text-on-surface">
            {order.orderNumber}
          </Text>
          <View className="flex-row items-center gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <Users size={13} color="#79747E" />
              <Text className="text-xs font-regular text-on-surface-variant">
                Table {order.tableNumber} · {order.customerCount}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={13} color="#79747E" />
              <Text className="text-xs font-regular text-on-surface-variant">
                {elapsedLabel(order.sentToKitchenAt)}
              </Text>
            </View>
          </View>
        </View>
        <StatusChip status={order.status} />
      </View>

      <View className="gap-1.5 mb-3">
        {order.items.map((item) => {
          const recipe = recipeById(item.recipeId);
          return (
            <View key={item.id} className="flex-row justify-between">
              <Text className="text-sm font-semibold text-on-surface">
                {item.quantity}× {recipe?.name}
              </Text>
            </View>
          );
        })}
      </View>

      {order.notes && (
        <View className="bg-amber-50 rounded-lg px-3 py-2 mb-3">
          <Text className="text-xs font-regular text-amber-800">
            Note: {order.notes}
          </Text>
        </View>
      )}

      {NEXT_ACTION_LABEL[order.status] && (
        <Pressable
          onPress={() => onAdvance(order.id)}
          className="bg-primary rounded-full py-2.5 items-center active:opacity-90"
        >
          <Text className="text-on-primary font-semibold text-sm">
            {NEXT_ACTION_LABEL[order.status]}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
