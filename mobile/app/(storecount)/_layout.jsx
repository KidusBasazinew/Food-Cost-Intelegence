import { Tabs, Redirect } from "expo-router";
import { ClipboardCheck, User } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { CustomTabBar } from "../../components/CustomTabBar";

const STORECOUNT_ICONS = { count: ClipboardCheck, profile: User };

export default function StoreCountLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "storecount") return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} icons={STORECOUNT_ICONS} />}
    >
      <Tabs.Screen name="count" options={{ title: "Count" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
