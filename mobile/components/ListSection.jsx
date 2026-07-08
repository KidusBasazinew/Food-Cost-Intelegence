import { View, Text } from "react-native";

export function ListSection({ title, children }) {
  return (
    <View className="mb-5">
      {title && (
        <Text className="text-xs font-semibold text-primary px-1 mb-2 uppercase tracking-wide">
          {title}
        </Text>
      )}
      <View className="bg-surface-container-low rounded-[20px] overflow-hidden border border-outline-variant/10">
        {children}
      </View>
    </View>
  );
}
