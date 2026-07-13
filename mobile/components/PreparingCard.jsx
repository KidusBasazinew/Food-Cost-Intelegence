import { View, Text, Pressable, Image } from "react-native";
import { Clock } from "lucide-react-native";
import { recipeById } from "../mock/posOrders";
import { elapsedLabel, minutesSince } from "../utils/format";
import { StatusChip } from "./StatusChip";

const ESTIMATED_PREP_MINUTES = 15;

export function estimateProgress(order) {
  if (["READY", "SERVED", "COMPLETED"].includes(order.status)) return 100;
  const elapsed = minutesSince(order.sentToKitchenAt);
  return Math.min(Math.round((elapsed / ESTIMATED_PREP_MINUTES) * 100), 95);
}

export function PreparingCard({ order, onAdvance }) {
  const firstItem = order.items[0];
  const recipe = recipeById(firstItem.recipeId);
  const progress = estimateProgress(order);

  return (
    <Pressable
      onPress={() => onAdvance(order.id)}
      className="bg-white p-4 rounded-2xl border border-outline-variant flex-row items-center gap-3 mb-3 active:opacity-90"
    >
      <View className="w-24 h-24 rounded-xl bg-secondary-container items-center justify-center">
        {recipe?.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            className="w-24 h-24 rounded-xl"
          />
        ) : (
          <Text className="text-lg font-semibold text-secondary">
            {recipe?.name?.[0]}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-lg font-semibold text-on-surface flex-1 mr-2"
            numberOfLines={1}
          >
            {recipe?.name}
            {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-3">
            <Text className="text-xs font-regular text-on-surface-variant">
              Qty: {firstItem.quantity}
            </Text>
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#79747E" />
              <Text className="text-xs font-regular text-on-surface-variant">
                {elapsedLabel(order.sentToKitchenAt)}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-2/3">
          <StatusChip status={order.status} />
        </View>
      </View>

      <View className="items-end gap-1">
        <Text className="text-[10px] font-semibold text-outline">
          {progress}%
        </Text>
        <View className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <View
            style={{ width: `${progress}%` }}
            className="bg-primary h-full"
          />
        </View>
      </View>
    </Pressable>
  );
}
