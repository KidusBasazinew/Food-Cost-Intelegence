import { View, Text } from "react-native";

export function ScreenHeader({ title, subtitle }) {
  return (
    <View className="mb-5">
      <Text className="text-2xl font-semibold text-on-surface">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-on-surface-variant mt-0.5">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
