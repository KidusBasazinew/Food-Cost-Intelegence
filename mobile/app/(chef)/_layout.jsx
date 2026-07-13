import { Tabs, Redirect } from "expo-router";
import {
  Home,
  ClipboardList,
  Utensils,
  Package,
  User,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { CustomTabBar } from "../../components/CustomTabBar";

const CHEF_ICONS = {
  dashboard: Home,
  orders: ClipboardList,
  recipe: Utensils,
  inventory: Package,
  profile: User,
};
Object.entries(CHEF_ICONS).forEach(([key, val]) => {
  if (!val) console.warn(`Missing icon for route: ${key}`);
});

export default function ChefLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "chef") return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} icons={CHEF_ICONS} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="recipe" options={{ title: "Recipe" }} />
      <Tabs.Screen name="inventory" options={{ title: "Inventory" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
