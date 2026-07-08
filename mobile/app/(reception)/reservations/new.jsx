import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Check } from "lucide-react-native";
import { rooms } from "../../../mock/rooms";

const AVAILABLE_STATUSES = ["VACANT", "READY"];

export default function NewReservation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [notes, setNotes] = useState("");

  const availableRooms = useMemo(
    () => rooms.filter((r) => AVAILABLE_STATUSES.includes(r.status)),
    [],
  );
  const canSubmit =
    guestName.trim().length > 0 &&
    guestPhone.trim().length > 0 &&
    selectedRoomId;

  const handleCreate = () => {
    // Mock only — real submit becomes a POST /reservations call later,
    // this is the single spot that changes when the backend is wired in.
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <View
        style={{ paddingTop: insets.top }}
        className="bg-surface-container-low"
      >
        <View className="flex-row items-center justify-between px-4 h-14">
          <Text className="font-semibold text-lg text-primary">
            New Reservation
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
          >
            <X size={22} color="#494551" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
      >
        <View className="gap-2">
          <Text className="font-semibold text-sm text-on-surface">
            Guest Name
          </Text>
          <TextInput
            value={guestName}
            onChangeText={setGuestName}
            placeholder="e.g. Liya Bekele"
            placeholderTextColor="#79747E"
            className="bg-surface-container-high rounded-2xl px-4 py-0 h-12 font-regular text-sm text-on-surface"
            verticalAlign="center"
          />
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-sm text-on-surface">
            Phone Number
          </Text>
          <TextInput
            value={guestPhone}
            onChangeText={setGuestPhone}
            placeholder="09XX XXX XXX"
            placeholderTextColor="#79747E"
            keyboardType="phone-pad"
            className="bg-surface-container-high rounded-2xl px-4 py-0 h-12 font-regular text-sm text-on-surface"
            verticalAlign="center"
          />
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-sm text-on-surface">
            Select Room ({availableRooms.length} available)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {availableRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              return (
                <Pressable
                  key={room.id}
                  onPress={() => setSelectedRoomId(room.id)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface-container-high border-transparent"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${isSelected ? "text-on-primary" : "text-on-surface"}`}
                  >
                    {room.roomNumber}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-sm text-on-surface">
            Notes (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Special requests..."
            placeholderTextColor="#79747E"
            multiline
            numberOfLines={3}
            className="bg-surface-container-high rounded-2xl px-4 py-3 font-regular text-sm text-on-surface"
            style={{ textAlignVertical: "center" }}
          />
        </View>

        <Pressable
          onPress={handleCreate}
          disabled={!canSubmit}
          className={`rounded-xl py-3.5 items-center flex-row justify-center gap-2 mt-2 ${
            canSubmit
              ? "bg-primary active:opacity-90"
              : "bg-surface-container-highest"
          }`}
        >
          <Check size={18} color={canSubmit ? "#FFFFFF" : "#79747E"} />
          <Text
            className={`font-semibold text-sm ${canSubmit ? "text-on-primary" : "text-on-surface-variant"}`}
          >
            Create Reservation
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
