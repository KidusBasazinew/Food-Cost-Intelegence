import { View, Image, Text, Pressable } from "react-native";
import { Bell } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Header({ user, title, initials, onBellPress = () => {} }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-surface-container-low"
    >
      <View className="flex-row items-center justify-between px-5 h-16">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center">
            {user.imageUrl ? (
              <Image
                className="w-10 h-10 border-2 border-primary rounded-full"
                src={user.imageUrl}
              />
            ) : (
              <Text className="text-primary font-semibold text-xs">
                {initials}
              </Text>
            )}
          </View>
          <Text className="text-lg font-semibold text-primary">{title}</Text>
        </View>
        <Pressable
          onPress={onBellPress}
          className="w-11 h-11 rounded-full items-center justify-center active:bg-surface-variant/50"
        >
          <Bell size={22} color="#4F378A" />
        </Pressable>
      </View>
    </View>
  );
}
