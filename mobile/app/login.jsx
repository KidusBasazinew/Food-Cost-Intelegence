import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
const ROLE_HOME = {
  chef: "dashboard",
  reception: "dashboard",
  manager: "dashboard",
  storecount: "count",
};
export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleKey = async (key) => {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (key === "") return;
    if (pin.length >= 4) return;

    const next = pin + key;
    setPin(next);

    if (next.length === 4) {
      const result = await login(next);
      if (result.success) {
        router.replace(
          `/(${result.employee.role})/${ROLE_HOME[result.employee.role]}`,
        );
      } else {
        setError("Incorrect PIN");
        setPin("");
      }
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome</Text>
      <Text className="text-gray-500 font-regular mb-8">
        Enter your 4-digit PIN
      </Text>

      {/* PIN dots */}
      <View className="flex-row gap-4 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < pin.length ? "bg-violet-600" : "bg-gray-200"
            }`}
          />
        ))}
      </View>

      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

      {/* Keypad */}
      <View className="flex-row flex-wrap w-72 justify-center mt-6">
        {KEYS.map((key, i) => (
          <Pressable
            key={i}
            onPress={() => handleKey(key)}
            disabled={key === ""}
            className="w-20 h-20 items-center justify-center m-1 rounded-full active:bg-gray-100"
          >
            <Text className="text-2xl font-semibold text-gray-800">{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
