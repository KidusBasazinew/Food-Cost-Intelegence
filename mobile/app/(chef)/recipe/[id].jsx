import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react-native";
import { recipeById, estimateProfitMargin } from "../../../mock/recipes";
import { formatETB } from "../../../utils/format";

function StatPill({ icon: Icon, label, value, tone = "primary" }) {
  const bg =
    tone === "success"
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : tone === "warning"
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-indigo-50 dark:bg-indigo-950/30"; // Replaced generic container token with matching Indigo depth

  const iconColor =
    tone === "success"
      ? "#059669" // Emerald 600 - brighter and clearer
      : tone === "warning"
        ? "#D97706" // Amber 600 - clean and visible
        : "#4F46E5"; // Indigo 600 - perfect standard tone companion

  const textColor =
    tone === "success"
      ? "text-emerald-800 dark:text-emerald-300" // Elevated contrast score
      : tone === "warning"
        ? "text-amber-800 dark:text-amber-300"
        : "text-indigo-800 dark:text-indigo-300";

  return (
    <View className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
      <Icon size={18} color={iconColor} />
      <Text className={`font-semibold text-sm ${textColor}`}>{value}</Text>
      <Text className="font-regular text-[10px] text-on-surface-variant text-center">
        {label}
      </Text>
    </View>
  );
}

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipe = recipeById(id);

  if (!recipe) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="font-regular text-on-surface-variant">
          Recipe not found.
        </Text>
      </View>
    );
  }

  const { profitCents, marginPercent } = estimateProfitMargin(recipe);
  const marginTone =
    marginPercent >= 60
      ? "success"
      : marginPercent >= 40
        ? "warning"
        : "primary";

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header image */}
        <View className="relative">
          <ImageBackground
            source={{ uri: recipe.imageUrl }}
            style={{ width: "100%", height: 260 }}
            resizeMode="cover"
          >
            <View className="absolute inset-0 bg-black/25" />
            <Pressable
              onPress={() => router.back()}
              style={{ marginTop: insets.top + 8 }}
              className="ml-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center active:opacity-80"
            >
              <ArrowLeft size={20} color="#1C1B1F" />
            </Pressable>
          </ImageBackground>
        </View>

        <View className="px-4 -mt-6">
          {/* Title card */}
          <View className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/20">
            <Text className="font-semibold text-2xl text-on-surface">
              {recipe.name}
            </Text>
            <Text className="font-regular text-sm text-on-surface-variant mt-1.5 leading-5">
              {recipe.description}
            </Text>

            {/* Stat row */}
            <View className="flex-row gap-2.5 mt-5">
              <StatPill
                icon={Clock}
                label="Prep Time"
                value={`${recipe.prepMinutes}m`}
              />
              <StatPill
                icon={DollarSign}
                label="Sell Price"
                value={formatETB(recipe.sellingPriceCents)}
              />
              <StatPill
                icon={TrendingUp}
                label="Margin"
                value={`${marginPercent}%`}
                tone={marginTone}
              />
            </View>
          </View>

          {/* Cost breakdown */}
          <View className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/20 mt-4">
            <Text className="font-semibold text-base text-on-surface mb-3">
              Cost Breakdown
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="font-regular text-sm text-on-surface-variant">
                  Ingredient Cost
                </Text>
                <Text className="font-semibold text-sm text-on-surface">
                  {formatETB(recipe.totalCostCents)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-regular text-sm text-on-surface-variant">
                  Selling Price
                </Text>
                <Text className="font-semibold text-sm text-on-surface">
                  {formatETB(recipe.sellingPriceCents)}
                </Text>
              </View>
              <View className="h-[1px] bg-outline-variant/30 my-1" />
              <View className="flex-row justify-between">
                <Text className="font-semibold text-sm text-on-surface">
                  Estimated Profit
                </Text>
                <Text className="font-semibold text-sm text-emerald-700">
                  {formatETB(profitCents)}
                </Text>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mt-4">
            <View className="flex-row items-center gap-2 mb-3 px-1">
              <Package size={16} color="#4F378A" />
              <Text className="font-semibold text-base text-on-surface">
                Ingredients ({recipe.ingredients.length})
              </Text>
            </View>

            <View className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/20">
              {recipe.ingredients.map((ing, i) => (
                <View key={ing.id}>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-1">
                      <Text className="font-semibold text-sm text-on-surface">
                        {ing.name}
                      </Text>
                      <Text className="font-regular text-xs text-on-surface-variant mt-0.5">
                        {ing.quantity} {ing.unit}
                      </Text>
                    </View>
                    <Text className="font-semibold text-sm text-primary">
                      {formatETB(ing.costCents)}
                    </Text>
                  </View>
                  {i !== recipe.ingredients.length - 1 && (
                    <View className="h-[1px] bg-outline-variant/30 mx-4" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Yield info */}
          <View className="bg-primary-container rounded-2xl p-4 mt-4 flex-row items-center justify-between">
            <Text className="font-regular text-sm text-on-primary-container">
              Recipe Yield
            </Text>
            <Text className="font-semibold text-sm text-on-primary-container">
              {recipe.yieldQuantity} {recipe.yieldUnit?.toLowerCase()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
