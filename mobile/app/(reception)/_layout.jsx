import { Tabs, Redirect } from "expo-router";
import {
  Home,
  ClipboardCheck,
  ClipboardList,
  Package,
  User,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { CustomTabBar } from "../../components/CustomTabBar";

const CHEF_ICONS = {
  dashboard: Home,
  reservations: ClipboardList,
  tasks: ClipboardCheck,
  profile: User,
};
Object.entries(CHEF_ICONS).forEach(([key, val]) => {
  if (!val) console.warn(`Missing icon for route: ${key}`);
});
export default function ReceptionLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "reception") return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} icons={CHEF_ICONS} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="reservations" options={{ title: "Reservations" }} />

      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
