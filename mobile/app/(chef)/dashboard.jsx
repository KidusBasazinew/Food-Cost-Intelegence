import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Utensils, Timer, Plus, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { posOrders as initialOrders } from "../../mock/posOrders";
import { inventoryItems } from "../../mock/inventoryItems";
import { NEXT_STATUS } from "../../utils/orderStatus";
import { Header } from "../../components/Header";
import { BentoCard } from "../../components/BentoCard";
import { NewOrderCard } from "../../components/NewOrderCard";
import { PreparingCard } from "../../components/PreparingCard";

export default function ChefDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);

  const newOrders = orders.filter(
    (o) =>
      o.status === "SENT_TO_KITCHEN" ||
      o.status === "READY" ||
      o.status === "PREPARING",
  );
  const preparingOrders = orders.filter(
    (o) => o.status === "PREPARING" || o.status === "READY",
  );
  const lowStockCount = inventoryItems.filter(
    (i) => i.quantityInStock < i.minimumStockLevel,
  ).length;
  const avgPrepMinutes = 18; // placeholder until real timing data exists

  const handleAdvance = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && NEXT_STATUS[o.status]
          ? { ...o, status: NEXT_STATUS[o.status] }
          : o,
      ),
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Kitchen Orders"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 24 }}
      >
        {/* Bento summary */}
        <View className="flex-row gap-4">
          <BentoCard
            icon={Utensils}
            label="New Orders"
            value={newOrders.length}
          />
          <BentoCard
            icon={Timer}
            label="Avg Prep Time"
            value={`${avgPrepMinutes}m`}
            tone="warning"
          />
        </View>
        <View className="flex-row gap-4">
          <BentoCard
            icon={Utensils}
            label="Low Stock Items"
            value={lowStockCount}
            tone="danger"
          />
          <BentoCard
            icon={Timer}
            label="Preparing"
            value={preparingOrders.length}
            tone="danger"
          />
        </View>

        {/* New Orders — horizontal */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-on-surface">
                New Orders
              </Text>
            </View>
            <View className="bg-error-container px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-on-error-container">
                {newOrders.length} Pending
              </Text>
            </View>
          </View>

          {newOrders.length === 0 ? (
            <View className="bg-surface-container-low rounded-2xl p-5 items-center">
              <Text className="text-sm text-on-surface-variant">
                No new orders right now
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {newOrders.map((order) => (
                <NewOrderCard
                  key={order.id}
                  order={order}
                  onAccept={handleAdvance}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Preparing — vertical */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-on-surface">
                Preparing
              </Text>
            </View>
            <Text className="text-xs font-regular text-on-surface-variant">
              {preparingOrders.length} In Progress
            </Text>
          </View>

          {preparingOrders.length === 0 ? (
            <View className="bg-surface-container-low rounded-2xl p-5 items-center">
              <Text className="text-sm text-on-surface-variant">
                Nothing cooking right now
              </Text>
            </View>
          ) : (
            preparingOrders.map((order) => (
              <PreparingCard
                key={order.id}
                order={order}
                onAdvance={handleAdvance}
              />
            ))
          )}
        </View>

        {/* Low stock nudge */}
        {lowStockCount > 0 && (
          <Pressable
            onPress={() => router.push("/(chef)/inventory")}
            className="bg-error-container rounded-2xl p-4 flex-row items-center justify-between"
          >
            <Text className="text-sm font-medium text-on-error-container">
              {lowStockCount} ingredient{lowStockCount > 1 ? "s" : ""} running
              low
            </Text>
            <ChevronRight size={18} color="#93000A" />
          </Pressable>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/(chef)/orders")}
        className="absolute right-6 bottom-6 w-14 h-14 bg-primary rounded-2xl items-center justify-center active:scale-95"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
