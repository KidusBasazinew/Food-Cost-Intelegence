import { Tabs, Redirect } from "expo-router";
import { Home, LineChart, Users, Package, User } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { CustomTabBar } from "../../components/CustomTabBar";

const MANAGER_ICONS = {
  dashboard: Home,
  analytics: LineChart,
  staff: Users,
  inventory: Package,
  profile: User,
};

export default function ManagerLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "manager") return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} icons={MANAGER_ICONS} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="staff" options={{ title: "Staff" }} />
      <Tabs.Screen name="inventory" options={{ title: "Inventory" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
