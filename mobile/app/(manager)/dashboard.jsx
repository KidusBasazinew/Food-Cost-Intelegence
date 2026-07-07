import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function ChefDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-16">
      <Text className="text-2xl font-bold text-gray-900">
        Hi, {user.firstName} 👋
      </Text>
      <Text className="text-gray-500 mb-6">Chef · {user.employeeCode}</Text>

      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-gray-700">
          Today's kitchen overview goes here.
        </Text>
      </View>

      <Pressable
        onPress={handleLogout}
        className="mt-auto mb-10 bg-red-50 rounded-xl py-3 items-center"
      >
        <Text className="text-red-500 font-semibold">Log out</Text>
      </Pressable>
    </View>
  );
}
