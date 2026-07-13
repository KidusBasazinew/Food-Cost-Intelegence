import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { reservations as initialReservations } from "../../../mock/reservations";
import { useAuth } from "../../../context/AuthContext";
import { Header } from "../../../components/Header";
import { SearchBar } from "../../../components/SearchBar";
import { FilterChips } from "../../../components/FilterChips";
import { ReservationCard } from "../../../components/ReservationCard";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "RESERVED", label: "Upcoming" },
  { key: "CHECKED_IN", label: "In-House" },
  { key: "CHECKED_OUT", label: "Checked Out" },
];

const NEXT_STATUS = {
  RESERVED: "CHECKED_IN",
  CHECKED_IN: "CHECKED_OUT",
};

export default function Reservations() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservations, setReservations] = useState(initialReservations);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const handleAction = (id) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== id || !NEXT_STATUS[r.status]) return r;
        const updated = { ...r, status: NEXT_STATUS[r.status] };
        if (updated.status === "CHECKED_OUT") {
          updated.actualCheckOutAt = new Date().toISOString();
        }
        return updated;
      }),
    );
  };

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const statusMatch = filter === "ALL" || r.status === filter;
      if (!statusMatch) return false;
      if (!search) return true;
      return r.guestName.toLowerCase().includes(search.toLowerCase());
    });
  }, [reservations, search, filter]);

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Reservations"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <View className="px-4 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search guest name..."
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
            <Text className="font-normal text-sm text-on-surface-variant">
              No reservations match.
            </Text>
          </View>
        ) : (
          filtered.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onAction={handleAction}
            />
          ))
        )}
      </ScrollView>
      <Pressable
        onPress={() => router.push("/(reception)/reservations/new")}
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
