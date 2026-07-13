import { View, Text } from "react-native";

export function BentoCard({ icon: Icon, label, value, tone = "primary" }) {
  const styles =
    tone === "tertiary"
      ? {
          bg: "bg-tertiary-fixed",
          text: "text-on-tertiary-fixed",
          iconColor: "#633B48",
        }
      : tone === "warning"
        ? {
            bg: "bg-warning-fixed",
            text: "text-on-warning-fixed",
            iconColor: "#8A5A00",
          }
        : tone === "danger"
          ? {
              bg: "bg-danger-fixed",
              text: "text-on-danger-fixed",
              iconColor: "#BA1A1A",
            }
          : {
              bg: "bg-primary-container",
              text: "text-on-primary-container",
              iconColor: "#4F378A",
            };

  return (
    <View className={`flex-1 ${styles.bg} rounded-xl p-4 h-32 justify-between`}>
      <Text className={`text-xs font-medium ${styles.text} opacity-80`}>
        {label}
      </Text>
      <View className="flex-row items-end justify-between">
        <Text className={`text-4xl font-semibold ${styles.text}`}>{value}</Text>
        <Icon size={22} color={styles.iconColor} />
      </View>
    </View>
  );
}
