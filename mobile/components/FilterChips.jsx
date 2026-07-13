import { ScrollView, Pressable, Text } from "react-native";

export function FilterChips({ options, active, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
    >
      {options.map((opt) => {
        const isActive = active === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            className={`h-8 px-4 rounded-lg items-center justify-center border ${
              isActive
                ? "bg-secondary-container border-transparent"
                : "bg-surface-container-highest border-outline-variant"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isActive
                  ? "text-on-secondary-container"
                  : "text-on-surface-variant"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
