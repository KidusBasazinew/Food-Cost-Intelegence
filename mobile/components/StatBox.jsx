import { View, Text } from "react-native";

export function StatBox({ icon: Icon, label, value, tone = "primary" }) {
  const iconColor = tone === "tertiary" ? "#633B48" : "#4F378A";
  return (
    <View className="flex-1 bg-surface-container rounded-xl p-4 h-28 justify-between border border-outline-variant/20">
      <Icon size={20} color={iconColor} />
      <View>
        <Text className="text-xs font-regular text-on-surface-variant">
          {label}
        </Text>
        <Text className="text-base font-semibold text-on-surface">{value}</Text>
      </View>
    </View>
  );
}
