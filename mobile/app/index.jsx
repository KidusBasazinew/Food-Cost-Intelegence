import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

const ONBOARDING_KEY = "has_onboarded";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) =>
      setHasOnboarded(val === "true"),
    );
  }, []);

  if (isLoading || hasOnboarded === null) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#6750A4" />
      </View>
    );
  }

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/login" />;

  switch (user.role) {
    case "chef":
      return <Redirect href="/(chef)/dashboard" />;
    case "reception":
      return <Redirect href="/(reception)/dashboard" />;
    case "manager":
      return <Redirect href="/(manager)/dashboard" />;
    case "storecount":
      return <Redirect href="/(storecount)/dashboard" />;
    default:
      return <Redirect href="/login" />;
  }
}
