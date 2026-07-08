import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { inventoryItems } from "../../mock/inventoryItems";
import { Header } from "../../components/Header";
import { SearchBar } from "../../components/SearchBar";
import { FilterChips } from "../../components/FilterChips";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "LOW", label: "Low Stock" },
  { key: "MEAT", label: "Meat" },
  { key: "DAIRY", label: "Dairy" },
  { key: "PRODUCE", label: "Produce" },
];

function InventoryCard({ item }) {
  const isLow = item.quantityInStock < item.minimumStockLevel;
  const ratio = Math.min(
    item.quantityInStock / (item.minimumStockLevel * 2),
    1,
  );

  return (
    <View className="bg-surface-container-low rounded-xl p-4 border border-outline-variant gap-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-base font-semibold text-on-surface">
            {item.name}
          </Text>
          <Text className="text-xs font-regular text-on-surface-variant mt-0.5">
            {item.category.charAt(0) + item.category.slice(1).toLowerCase()} ·{" "}
            {item.sku}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${isLow ? "bg-error-container" : "bg-secondary-container"}`}
        >
          <Text
            className={`text-xs font-regular ${isLow ? "text-on-error-container" : "text-on-secondary-container"}`}
          >
            {isLow ? "Low" : "In Stock"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-3xl font-semibold text-primary">
            {item.quantityInStock}{" "}
            <Text className="text-base font-normal">{item.unit}</Text>
          </Text>
          <View className="w-28 h-1.5 bg-outline-variant/40 rounded-full mt-1.5 overflow-hidden">
            <View
              style={{ width: `${Math.max(ratio * 100, 6)}%` }}
              className={`h-full ${isLow ? "bg-error" : "bg-primary"}`}
            />
          </View>
        </View>

        <Pressable className="h-10 px-4 bg-primary rounded-full items-center justify-center active:opacity-90">
          <Text className="text-on-primary text-xs font-semibold">
            Request Restock
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Inventory() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "ALL") return true;
      if (filter === "LOW")
        return item.quantityInStock < item.minimumStockLevel;
      return item.category === filter;
    });
  }, [search, filter]);

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Stock Inventory"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <View className="px-4 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search ingredients..."
        />
        <FilterChips
          options={CATEGORY_FILTERS}
          active={filter}
          onChange={setFilter}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          gap: 12,
        }}
      >
        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-on-surface-variant text-sm">
              No ingredients match.
            </Text>
          </View>
        ) : (
          filtered.map((item) => <InventoryCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}
