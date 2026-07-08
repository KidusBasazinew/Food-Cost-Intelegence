import { View, Text, Pressable, Image } from "react-native";
import { Clock, ChefHat } from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatETB } from "../utils/format";

const CATEGORY_TINTS = {
  MAIN: "bg-primary-container",
  SALAD: "bg-secondary-container",
  SNACK: "bg-tertiary-fixed",
  DRINK: "bg-secondary-container",
  DESSERT: "bg-tertiary-fixed",
  APPETIZER: "bg-primary-container",
  OTHER: "bg-surface-container-highest",
};

export function RecipeCard({ recipe }) {
  const router = useRouter();
  const tint =
    CATEGORY_TINTS[recipe.category] ?? "bg-surface-container-highest";

  return (
    <Pressable
      onPress={() => router.push(`/(chef)/recipe/${recipe.id}`)}
      className="w-[47%] bg-surface-container-low rounded-[20px] overflow-hidden active:opacity-90"
    >
      <View className={`h-28 w-full items-center justify-center ${tint}`}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <ChefHat size={32} color="#4F378A" strokeWidth={1.8} />
        )}
      </View>
      <View className="p-3">
        <Text
          className="font-semibold text-sm text-on-surface"
          numberOfLines={1}
        >
          {recipe.name}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <Clock size={13} color="#79747E" />
            <Text className="font-regular text-xs text-on-surface-variant">
              {recipe.prepMinutes}m
            </Text>
          </View>
          <Text className="font-semibold text-xs text-primary">
            {formatETB(recipe.sellingPriceCents)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
