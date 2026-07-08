import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Phone,
  Calendar,
  DoorOpen,
  AlertTriangle,
} from "lucide-react-native";
import { reservationById } from "../../../mock/reservations";
import { roomById } from "../../../mock/rooms";
import { formatETB, formatDate } from "../../../utils/format";
import { calculateLateCheckout } from "../../../utils/lateCheckout";
import { ReservationStatusChip } from "../../../components/ReservationStatusChip";

export default function ReservationDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reservation, setReservation] = useState(reservationById(id));

  if (!reservation) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="font-regular text-on-surface-variant">
          Reservation not found.
        </Text>
      </View>
    );
  }

  const room = roomById(reservation.roomId);
  const lateInfo =
    reservation.status === "CHECKED_IN"
      ? calculateLateCheckout(reservation.checkOutAt, new Date().toISOString())
      : { isLate: false };

  const handleCheckIn = () => {
    setReservation((prev) => ({ ...prev, status: "CHECKED_IN" }));
  };

  const handleCheckOut = () => {
    const now = new Date().toISOString();
    const fee = calculateLateCheckout(reservation.checkOutAt, now);
    setReservation((prev) => ({
      ...prev,
      status: "CHECKED_OUT",
      actualCheckOutAt: now,
      lateCheckoutFeeCents: fee.feeCents,
    }));
  };

  return (
    <View className="flex-1 bg-background">
      <View
        style={{ paddingTop: insets.top }}
        className="bg-surface-container-low"
      >
        <View className="flex-row items-center px-4 h-14">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center -ml-2"
          >
            <ArrowLeft size={22} color="#4F378A" />
          </Pressable>
          <Text className="font-semibold text-lg text-primary ml-1">
            Reservation Details
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
      >
        {/* Guest hero */}
        <View className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/20 items-center">
          <View className="w-16 h-16 rounded-full bg-secondary-container items-center justify-center mb-3">
            <Text className="font-semibold text-xl text-secondary">
              {reservation.guestName[0]}
            </Text>
          </View>
          <Text className="font-semibold text-xl text-on-surface">
            {reservation.guestName}
          </Text>
          <View className="flex-row items-center gap-1 mt-1 mb-3">
            <Phone size={13} color="#79747E" />
            <Text className="font-regular text-sm text-on-surface-variant">
              {reservation.guestPhone}
            </Text>
          </View>
          <ReservationStatusChip status={reservation.status} />
        </View>

        {/* Stay info */}
        <View className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/20 gap-3">
          <Text className="font-semibold text-base text-on-surface mb-1">
            Stay Details
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <DoorOpen size={16} color="#4F378A" />
              <Text className="font-regular text-sm text-on-surface-variant">
                Room
              </Text>
            </View>
            <Text className="font-semibold text-sm text-on-surface">
              {room?.roomNumber} · Floor {room?.floor}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#4F378A" />
              <Text className="font-regular text-sm text-on-surface-variant">
                Check-in
              </Text>
            </View>
            <Text className="font-semibold text-sm text-on-surface">
              {formatDate(reservation.checkInAt)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#4F378A" />
              <Text className="font-regular text-sm text-on-surface-variant">
                Scheduled Check-out
              </Text>
            </View>
            <Text className="font-semibold text-sm text-on-surface">
              {formatDate(reservation.checkOutAt)}
            </Text>
          </View>

          {reservation.notes && (
            <View className="bg-secondary-container/50 rounded-lg px-3 py-2 mt-1">
              <Text className="font-regular text-xs text-on-secondary-container">
                {reservation.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Live late-checkout warning — only while still checked in and past scheduled time */}
        {lateInfo.isLate && (
          <View className="bg-error-container rounded-2xl p-4 flex-row gap-3">
            <AlertTriangle size={20} color="#93000A" />
            <View className="flex-1">
              <Text className="font-semibold text-sm text-on-error-container">
                Late Checkout in Progress
              </Text>
              <Text className="font-regular text-xs text-on-error-container/80 mt-0.5">
                {lateInfo.breakdown} · Estimated charge:{" "}
                {formatETB(lateInfo.feeCents)}
              </Text>
            </View>
          </View>
        )}

        {/* Already checked out — show final fee if one was applied */}
        {reservation.status === "CHECKED_OUT" &&
          reservation.lateCheckoutFeeCents > 0 && (
            <View className="bg-amber-50 rounded-2xl p-4">
              <Text className="font-semibold text-sm text-amber-800">
                Late Checkout Fee Applied
              </Text>
              <Text className="font-regular text-xs text-amber-700 mt-0.5">
                {formatETB(reservation.lateCheckoutFeeCents)} charged for late
                departure
              </Text>
            </View>
          )}

        {/* Action */}
        {reservation.status === "RESERVED" && (
          <Pressable
            onPress={handleCheckIn}
            className="bg-primary rounded-xl py-3.5 items-center active:opacity-90"
          >
            <Text className="font-semibold text-sm text-on-primary">
              Check In Guest
            </Text>
          </Pressable>
        )}

        {reservation.status === "CHECKED_IN" && (
          <Pressable
            onPress={handleCheckOut}
            className="bg-primary rounded-xl py-3.5 items-center active:opacity-90"
          >
            <Text className="font-semibold text-sm text-on-primary">
              {lateInfo.isLate
                ? `Check Out & Charge ${formatETB(lateInfo.feeCents)}`
                : "Check Out Guest"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
