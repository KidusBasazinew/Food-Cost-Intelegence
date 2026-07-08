import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Phone, Calendar, DoorOpen } from "lucide-react-native";
import { roomById } from "../mock/rooms";
import { formatDate } from "../utils/format";
import { ReservationStatusChip } from "./ReservationStatusChip";

const ACTION_LABEL = { RESERVED: "Check In", CHECKED_IN: "Check Out" };

export function ReservationCard({ reservation, onAction }) {
  const router = useRouter();
  const room = roomById(reservation.roomId);
  const action = ACTION_LABEL[reservation.status];

  return (
    <Pressable
      onPress={() => router.push(`/(reception)/reservations/${reservation.id}`)}
      className="bg-surface-container-low rounded-2xl p-4 mb-3 border border-outline-variant/20 active:opacity-90"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-base text-on-surface">
            {reservation.guestName}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Phone size={12} color="#79747E" />
            <Text className="font-regular text-xs text-on-surface-variant">
              {reservation.guestPhone}
            </Text>
          </View>
        </View>
        <ReservationStatusChip status={reservation.status} />
      </View>

      <View className="flex-row items-center gap-4 mb-3">
        <View className="flex-row items-center gap-1.5">
          <DoorOpen size={14} color="#4F378A" />
          <Text className="font-semibold text-sm text-on-surface">
            Room {room?.roomNumber}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#79747E" />
          <Text className="font-regular text-xs text-on-surface-variant">
            {formatDate(reservation.checkInAt)} →{" "}
            {formatDate(reservation.checkOutAt)}
          </Text>
        </View>
      </View>

      {reservation.notes && (
        <View className="bg-secondary-container/50 rounded-lg px-3 py-2 mb-3">
          <Text className="font-regular text-xs text-on-secondary-container">
            {reservation.notes}
          </Text>
        </View>
      )}

      {action && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // don't trigger the card's navigation
            onAction(reservation.id);
          }}
          className="bg-primary rounded-xl py-2.5 items-center active:opacity-90"
        >
          <Text className="font-semibold text-sm text-on-primary">
            {action}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
