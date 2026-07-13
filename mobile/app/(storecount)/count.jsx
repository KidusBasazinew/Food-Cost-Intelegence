import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { ClipboardCheck, AlertCircle } from "lucide-react-native";
import { activeStockCount } from "../../mock/stockcounts";
import { calculateVariance } from "../../utils/stockCount";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import { SearchBar } from "../../components/SearchBar";
import { IngredientCountCard } from "../../components/IngredientCountCard";
import { NumPadModal } from "../../components/NumPadModal";
import { BentoCard } from "../../components/BentoCard";

export default function Count() {
  const { user } = useAuth();
  const [items, setItems] = useState(activeStockCount.items);
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const countedCount = items.filter((i) => i.physicalQuantity !== null).length;
  const varianceCount = items.filter(
    (i) => i.varianceQuantity && i.varianceQuantity !== 0,
  ).length;

  const filtered = useMemo(
    () =>
      items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const handleSubmitCount = (itemId, physicalQuantity) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const { varianceQuantity, variancePercentage } = calculateVariance(
          i.systemQuantity,
          physicalQuantity,
        );
        return { ...i, physicalQuantity, varianceQuantity, variancePercentage };
      }),
    );
    setActiveItem(null);
  };

  const handleFinishCount = () => {
    if (countedCount < items.length) {
      Alert.alert(
        "Incomplete Count",
        `${items.length - countedCount} ingredient(s) still need counting.`,
      );
      return;
    }
    Alert.alert("Stock Count Submitted", "This count is now marked complete.");
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Physical Count"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
      >
        <View className="flex-row gap-4">
          <BentoCard
            icon={ClipboardCheck}
            label="Counted"
            value={`${countedCount}/${items.length}`}
            tone="primary"
          />
          <BentoCard
            icon={AlertCircle}
            label="Variances Found"
            value={varianceCount}
            tone="tertiary"
          />
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search ingredients..."
        />

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filtered.map((item) => (
            <IngredientCountCard
              key={item.id}
              item={item}
              onPress={setActiveItem}
            />
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={handleFinishCount}
        className="absolute left-6 right-6 bottom-6 bg-primary rounded-2xl py-4 items-center active:opacity-90"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text className="font-semibold text-sm text-on-primary">
          Submit Count ({countedCount}/{items.length})
        </Text>
      </Pressable>

      <NumPadModal
        visible={!!activeItem}
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onSubmit={handleSubmitCount}
      />
    </View>
  );
}
