import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Image,
  BadgeCheck,
  Timer,
  UtensilsCrossed,
  Users,
  CalendarDays,
  Settings2,
  SlidersHorizontal,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { employees, shifts } from "../../mock/employees";
import { recipes } from "../../mock/recipes";
import { Header } from "../../components/Header";
import { ListSection } from "../../components/ListSection";
import { ListRow } from "../../components/ListRow";
import { StatBox } from "../../components/StatBox";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [clockedIn, setClockedIn] = useState(true);

  const shift = user?.shiftId ? shifts[user.shiftId] : null;
  const activeRecipes = recipes.length;
  const staffOnDuty = employees.filter(
    (e) => e.isActive && e.shiftId === user?.shiftId,
  ).length;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Kitchen Ops"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 20 }}
      >
        {/* Profile hero */}
        <View className="bg-surface-container-highest rounded-3xl p-6 items-center border border-outline-variant/30">
          <View className="relative mb-3">
            {user.imageUrl ? (
              <View className="w-26 h-26 rounded-full border-4 border-primary/20 bg-primary-container items-center justify-center">
                <Image className="w-24 h-24 rounded-full" src={user.imageUrl} />
              </View>
            ) : (
              <View className="w-24 h-24 rounded-full border-4 border-primary/20 bg-primary-container items-center justify-center">
                <Text className="text-primary font-semibold text-3xl">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-surface-container-highest">
              <BadgeCheck size={16} color="#FFFFFF" />
            </View>
          </View>

          <Text className="text-2xl font-semibold text-on-surface">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm font-regular text-on-surface-variant mt-0.5 mb-4">
            {user?.employeeCode} · Chef · Kitchen Operations
          </Text>

          <Pressable
            onPress={() => setClockedIn((v) => !v)}
            className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full active:opacity-90 ${
              clockedIn ? "bg-secondary-container" : "bg-primary"
            }`}
          >
            <Timer size={18} color={clockedIn ? "#4A4358" : "#FFFFFF"} />
            <Text
              className={`text-sm font-semibold ${clockedIn ? "text-on-secondary-container" : "text-on-primary"}`}
            >
              {clockedIn ? "Clock Out" : "Clock In"}
            </Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3">
          <StatBox
            icon={UtensilsCrossed}
            label="Active Recipes"
            value={`${activeRecipes} items`}
            tone="primary"
          />
          <StatBox
            icon={Users}
            label="On This Shift"
            value={`${staffOnDuty} staff`}
            tone="tertiary"
          />
        </View>

        {/* Management */}
        <ListSection title="Management">
          <ListRow
            icon={CalendarDays}
            label="Shift Schedule"
            onPress={() => {}}
          />
          <ListRow
            icon={Settings2}
            label="Kitchen Settings"
            onPress={() => {}}
            isLast
          />
        </ListSection>

        {/* System */}
        <ListSection title="System">
          <ListRow
            icon={SlidersHorizontal}
            label="App Preferences"
            onPress={() => {}}
          />
          <ListRow
            icon={HelpCircle}
            label="Help & Support"
            onPress={() => {}}
            isLast
          />
        </ListSection>

        {/* Logout */}
        <View className="bg-error-container/20 rounded-[20px] border border-error/10 overflow-hidden">
          <ListRow
            icon={LogOut}
            label="Log Out"
            onPress={handleLogout}
            danger
            isLast
          />
        </View>

        <Text className="text-center text-xs text-on-surface-variant/60 mt-2">
          Food Cost Intelligence Platform v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
