import { Tabs, Redirect } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";

const Icon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function ReceptionLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "reception") return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#7C3AED" }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: Icon("🏠") }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ title: "Reservations", tabBarIcon: Icon("📅") }}
      />
      <Tabs.Screen
        name="guests"
        options={{ title: "Guests", tabBarIcon: Icon("🧑") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: Icon("👤") }}
      />
    </Tabs>
  );
}
