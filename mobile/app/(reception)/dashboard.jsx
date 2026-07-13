import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  BedDouble,
  LogIn,
  LogOut,
  AlertTriangle,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { rooms, roomById } from "../../mock/rooms";
import { todaysArrivals, todaysDepartures } from "../../mock/reservations";
import { ROOM_STATUS_STYLES } from "../../utils/roomStatus";
import { Header } from "../../components/Header";
import { BentoCard } from "../../components/BentoCard";
import { weeklyStats } from "../../mock/analytics";
import { ChartCard, CHART_COLORS } from "../../components/ChartCard";
import { formatETB } from "../../utils/format";

function GuestRow({ reservation, timeLabel, isLast }) {
  const room = roomById(reservation.roomId);
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${!isLast ? "border-b border-outline-variant/30" : ""}`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-9 h-9 rounded-full bg-secondary-container items-center justify-center">
          <Text className="font-semibold text-xs text-secondary">
            {reservation.guestName[0]}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="font-semibold text-sm text-on-surface"
            numberOfLines={1}
          >
            {reservation.guestName}
          </Text>
          <Text className="font-regular text-xs text-on-surface-variant">
            Room {room?.roomNumber}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1">
        <Clock size={12} color="#79747E" />
        <Text className="font-regular text-xs text-on-surface-variant">
          {timeLabel}
        </Text>
      </View>
    </View>
  );
}

export default function ReceptionDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const arrivals = todaysArrivals();
  const departures = todaysDepartures();
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const occupancyRate = Math.round((occupied / rooms.length) * 100);
  const needsAttention = rooms.filter((r) =>
    ["DIRTY", "OUT_OF_SERVICE"].includes(r.status),
  ).length;

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Front Desk"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 20 }}
      >
        {/* Bento summary */}
        <View className="flex-row gap-4">
          <BentoCard
            icon={BedDouble}
            label="Occupancy"
            value={`${occupancyRate}%`}
            tone="primary"
          />
          <BentoCard
            icon={AlertTriangle}
            label="Needs Attention"
            value={needsAttention}
            tone="tertiary"
          />
        </View>
        {/* Trends */}
        <ChartCard
          title="This Week's Trends"
          series={[
            {
              key: "PROFIT",
              label: "Profit",
              color: CHART_COLORS.PRIMARY,
              lightColor: CHART_COLORS.PRIMARY_LIGHT,
              formatValue: (v) => formatETB(v),
              data: weeklyStats.map((d) => ({
                value: d.dailyProfitCents,
                label: d.day,
              })),
            },
            {
              key: "RESERVATIONS",
              label: "Reservations",
              color: CHART_COLORS.TERTIARY,
              lightColor: CHART_COLORS.TERTIARY_LIGHT,
              formatValue: (v) => `${v} bookings`,
              data: weeklyStats.map((d) => ({
                value: d.reservationsCount,
                label: d.day,
              })),
            },
          ]}
        />
        {/* Arrivals */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <LogIn size={16} color="#4F378A" />
              <Text className="font-semibold text-base text-on-surface">
                Today's Arrivals
              </Text>
            </View>
            <View className="bg-primary-container px-2.5 py-1 rounded-full">
              <Text className="font-semibold text-xs text-on-primary-container">
                {arrivals.length}
              </Text>
            </View>
          </View>
          <View className="bg-surface-container-low rounded-2xl px-4 border border-outline-variant/20">
            {arrivals.length === 0 ? (
              <Text className="font-regular text-sm text-on-surface-variant py-4">
                No arrivals scheduled today.
              </Text>
            ) : (
              arrivals.map((r, i) => (
                <GuestRow
                  key={r.id}
                  reservation={r}
                  timeLabel={formatTime(r.checkInAt)}
                  isLast={i === arrivals.length - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* Departures */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <LogOut size={16} color="#633B48" />
              <Text className="font-semibold text-base text-on-surface">
                Today's Departures
              </Text>
            </View>
            <View className="bg-tertiary-fixed px-2.5 py-1 rounded-full">
              <Text className="font-semibold text-xs text-on-tertiary-fixed">
                {departures.length}
              </Text>
            </View>
          </View>
          <View className="bg-surface-container-low rounded-2xl px-4 border border-outline-variant/20">
            {departures.length === 0 ? (
              <Text className="font-regular text-sm text-on-surface-variant py-4">
                No departures scheduled today.
              </Text>
            ) : (
              departures.map((r, i) => (
                <GuestRow
                  key={r.id}
                  reservation={r}
                  timeLabel={formatTime(r.checkOutAt)}
                  isLast={i === departures.length - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* Rooms needing attention */}
        {needsAttention > 0 && (
          <Pressable
            onPress={() => router.push("/(reception)/reservations")}
            className="bg-error-container rounded-2xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-1">
              <Text className="font-semibold text-sm text-on-error-container">
                {needsAttention} room{needsAttention > 1 ? "s" : ""} need
                attention
              </Text>
              <Text className="font-regular text-xs text-on-error-container/80 mt-0.5">
                Dirty or out of service
              </Text>
            </View>
            <ChevronRight size={18} color="#93000A" />
          </Pressable>
        )}

        {/* Room status strip */}
        <View>
          <Text className="font-semibold text-base text-on-surface mb-3">
            Room Overview
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {rooms.map((room) => {
              const style = ROOM_STATUS_STYLES[room.status];
              return (
                <View
                  key={room.id}
                  className={`px-3 py-2 rounded-xl ${style.bg} min-w-[64px] items-center`}
                >
                  <Text className={`font-semibold text-sm ${style.text}`}>
                    {room.roomNumber}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className={`font-regular text-[9px] ${style.text}`}>
                      {style.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
