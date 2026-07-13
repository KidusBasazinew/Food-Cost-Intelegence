import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";

export function ListRow({
  icon: Icon,
  label,
  onPress,
  isLast,
  danger = false,
}) {
  return (
    <>
      <Pressable
        onPress={onPress}
        className={`flex-row items-center justify-between p-4 active:bg-surface-variant/30`}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              danger ? "bg-error-container" : "bg-primary/10"
            }`}
          >
            <Icon size={18} color={danger ? "#93000A" : "#4F378A"} />
          </View>
          <Text
            className={`text-base font-regular ${danger ? "font-regular text-error" : "text-on-surface"}`}
          >
            {label}
          </Text>
        </View>
        <ChevronRight size={18} color={danger ? "#BA1A1A" : "#79747E"} />
      </Pressable>
      {!isLast && <View className="h-[1px] bg-outline-variant/30 mx-4" />}
    </>
  );
}
