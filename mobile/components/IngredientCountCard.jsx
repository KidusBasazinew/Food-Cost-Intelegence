import { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Check, Package } from "lucide-react-native";

const VARIANCE_STYLES = {
  match: { bg: "bg-emerald-50", text: "text-emerald-700" },
  short: { bg: "bg-error-container", text: "text-on-error-container" },
  over: { bg: "bg-amber-50", text: "text-amber-700" },
};

export function IngredientCountCard({ item, onPress }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isCounted = item.physicalQuantity !== null;

  const varianceTone =
    item.varianceQuantity === null
      ? null
      : item.varianceQuantity === 0
        ? "match"
        : item.varianceQuantity < 0
          ? "short"
          : "over";

  return (
    <Pressable
      onPress={() => onPress(item)}
      className="w-[47%] bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/20 active:opacity-90"
    >
      {isCounted && (
        <View className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary items-center justify-center z-10">
          <Check size={13} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}

      <View className="w-14 h-14 rounded-xl bg-surface-container-high items-center justify-center self-center mb-2.5 overflow-hidden">
        {item.iconUrl && !imageFailed ? (
          <Image
            source={{ uri: item.iconUrl }}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Package size={26} color="#4F378A" strokeWidth={1.8} />
        )}
      </View>

      <Text
        className="font-semibold text-sm text-on-surface text-center"
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text className="font-normal text-xs text-on-surface-variant text-center mt-0.5 mb-2">
        System: {item.systemQuantity} {item.unit}
      </Text>

      {!isCounted ? (
        <View className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
          <View className="h-full bg-primary/40" style={{ width: "100%" }} />
        </View>
      ) : (
        <View
          className={`rounded-lg py-1.5 items-center ${VARIANCE_STYLES[varianceTone].bg}`}
        >
          <Text
            className={`font-semibold text-xs ${VARIANCE_STYLES[varianceTone].text}`}
          >
            {item.varianceQuantity === 0
              ? "Matches"
              : `${item.varianceQuantity > 0 ? "+" : ""}${item.varianceQuantity} (${item.variancePercentage}%)`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
