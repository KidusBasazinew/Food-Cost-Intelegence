import { View, Text } from "react-native";

export function MetricCard({ icon: Icon, label, value, tone = "neutral" }) {
  const toneStyles = {
    neutral: { iconBg: "bg-primary-container", iconColor: "#4F378A" },
    warning: { iconBg: "bg-amber-50", iconColor: "#B45309" },
    success: { iconBg: "bg-emerald-50", iconColor: "#047857" },
  }[tone];

  return (
    <View className="flex-1 bg-surface-container-low rounded-2xl p-4">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mb-3 ${toneStyles.iconBg}`}
      >
        <Icon size={18} color={toneStyles.iconColor} strokeWidth={2.2} />
      </View>
      <Text className="text-2xl font-semibold text-on-surface">{value}</Text>
      <Text className="text-xs text-on-surface-variant mt-0.5">{label}</Text>
    </View>
  );
}
