import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut, Clock, Phone, Calendar } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { shifts } from "../../mock/employees";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <View className="flex-row items-center py-3 border-b border-outline-variant/30">
      <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center mr-3">
        <Icon size={16} color="#79747E" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-on-surface-variant">{label}</Text>
        <Text className="text-sm font-medium text-on-surface mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shift = user?.shiftId ? shifts[user.shiftId] : null;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
      }}
    >
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-primary-container items-center justify-center mb-3">
          <Text className="text-primary font-bold text-2xl">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Text>
        </View>
        <Text className="text-xl font-bold text-on-surface">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-sm text-on-surface-variant">
          {user?.employeeCode} · Chef
        </Text>
      </View>

      <View className="bg-surface-container-low rounded-2xl px-4 mb-6">
        <InfoRow icon={Phone} label="Phone" value={user?.phone ?? "—"} />
        <InfoRow
          icon={Calendar}
          label="Hire date"
          value={user?.hireDate ?? "—"}
        />
        {shift && (
          <View className="flex-row items-center py-3">
            <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center mr-3">
              <Clock size={16} color="#79747E" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-on-surface-variant">Shift</Text>
              <Text className="text-sm font-medium text-on-surface mt-0.5">
                {shift.name} · {shift.startTime}–{shift.endTime}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Pressable
        onPress={handleLogout}
        className="bg-red-50 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
      >
        <LogOut size={16} color="#DC2626" />
        <Text className="text-red-600 font-semibold text-sm">Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
