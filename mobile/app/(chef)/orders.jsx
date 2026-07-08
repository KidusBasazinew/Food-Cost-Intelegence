import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { posOrders as initialOrders, recipeById } from "../../mock/posOrders";
import { NEXT_STATUS } from "../../utils/orderStatus";
import { Header } from "../../components/Header";
import { SearchBar } from "../../components/SearchBar";
import { FilterChips } from "../../components/FilterChips";
import { OrderCard } from "../../components/OrderCard";
import { useAuth } from "../../context/AuthContext";

const STATUS_FILTERS = [
  { key: "ACTIVE", label: "Active" },
  { key: "SENT_TO_KITCHEN", label: "New" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "COMPLETED", label: "Completed" },
];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ACTIVE");

  const handleAdvance = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && NEXT_STATUS[o.status]
          ? { ...o, status: NEXT_STATUS[o.status] }
          : o,
      ),
    );
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch =
        filter === "ACTIVE"
          ? ["SENT_TO_KITCHEN", "PREPARING", "READY"].includes(o.status)
          : o.status === filter;
      if (!statusMatch) return false;
      if (!search) return true;
      const searchLower = search.toLowerCase();
      const matchesOrderNumber = o.orderNumber
        .toLowerCase()
        .includes(searchLower);
      const matchesItem = o.items.some((item) =>
        recipeById(item.recipeId)?.name.toLowerCase().includes(searchLower),
      );
      return matchesOrderNumber || matchesItem;
    });
  }, [orders, search, filter]);

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Kitchen Orders"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <View className="px-4 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search orders or dishes..."
        />
        <FilterChips
          options={STATUS_FILTERS}
          active={filter}
          onChange={setFilter}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-on-surface-variant text-sm">
              No orders match.
            </Text>
          </View>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} onAdvance={handleAdvance} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
