import React from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function Dashboard() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      {/* Top App Bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row justify-between items-center px-4 pb-3 border-b border-surface-container-high bg-surface-container-low"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
            <Image
              className="w-full h-full"
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdh0-l-TwLY3VRt0BvIugN-D4pLPRuURbsdTNt7Ki6qEKS1QOStogKB-tg3Wy0Qqho18wC5Z2sWhyU38DOB3jxS46U-EjT1VsTZmu5BMx0viOlw83Z4fgVC1mErmxGcXoNoTNVrOAJsDpA0KMBTP_uUbvYKmnKgbhPgNpaYzWhSUPHy0UXDuSfc46QBKok5NjNbUoLLoOHK2zD4vHmSQ4emD-dplpaF5vZTnCH5dWUTG_RrAXfY3QcFZxOYw6QoenqJQ6aHLDnLs4",
              }}
            />
          </View>
          <Text className="text-xl font-semibold text-primary">
            Kitchen Orders
          </Text>
        </View>
        <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full">
          <MaterialIcons name="notifications-none" size={24} color="#4f378a" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        className="pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Bento Grid */}
        <View className="flex-row px-4 gap-4 mb-8">
          <View className="flex-1 h-32 rounded-xl p-4 justify-between bg-primary-container shadow-sm">
            <Text className="text-sm font-medium text-on-primary-container opacity-80">
              Total Orders
            </Text>
            <View className="flex-row items-end justify-between">
              <Text className="text-4xl font-semibold text-on-primary">24</Text>
              <MaterialIcons name="restaurant" size={24} color="#ffffff" />
            </View>
          </View>

          <View className="flex-1 h-32 rounded-xl p-4 justify-between bg-tertiary-fixed shadow-sm">
            <Text className="text-sm font-medium text-on-tertiary-fixed opacity-80">
              Avg Prep Time
            </Text>
            <View className="flex-row items-end justify-between">
              <Text className="text-4xl font-semibold text-on-tertiary-fixed">
                18m
              </Text>
              <MaterialIcons name="timer" size={24} color="#31111d" />
            </View>
          </View>
        </View>

        {/* Order Queue: New Orders */}
        <View className="gap-4 mb-8">
          <View className="flex-row justify-between items-center px-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-error" />
              <Text className="text-base font-medium text-on-surface">
                New Orders
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-error-container">
              <Text className="text-xs font-medium text-error">4 Pending</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            {/* Order Card 1 */}
            <View className="w-72 rounded-2xl p-4 border border-outline-variant/30 bg-surface-container-high">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-medium tracking-wider text-on-surface-variant">
                  #4022 • Table 12
                </Text>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={14} color="#ba1a1a" />
                  <Text className="text-xs font-medium text-error">3m ago</Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-on-surface mb-1">
                Grilled Salmon
              </Text>
              <Text className="text-sm text-on-surface-variant mb-4">
                Qty: 2 • Side: Asparagus
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-primary">
                  1,240 ETB
                </Text>
                <TouchableOpacity
                  className="px-6 py-2 rounded-full bg-primary"
                  activeOpacity={0.8}
                >
                  <Text className="text-sm font-medium text-on-primary">
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Card 2 */}
            <View className="w-72 rounded-2xl p-4 border border-outline-variant/30 bg-surface-container-high">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-medium tracking-wider text-on-surface-variant">
                  #4023 • Takeaway
                </Text>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={14} color="#ba1a1a" />
                  <Text className="text-xs font-medium text-error">5m ago</Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-on-surface mb-1">
                Ribeye Steak
              </Text>
              <Text className="text-sm text-on-surface-variant mb-4">
                Qty: 1 • Medium Rare
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-primary">
                  1,850 ETB
                </Text>
                <TouchableOpacity
                  className="px-6 py-2 rounded-full bg-primary"
                  activeOpacity={0.8}
                >
                  <Text className="text-sm font-medium text-on-primary">
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Order Queue: Preparing */}
        <View className="gap-4">
          <View className="flex-row justify-between items-center px-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-base font-medium text-on-surface">
                Preparing
              </Text>
            </View>
            <Text className="text-sm text-on-surface-variant">
              6 In Progress
            </Text>
          </View>

          <View className="px-4 gap-4">
            {/* Task Card 1 */}
            <View className="flex-row items-center p-4 rounded-2xl border border-outline-variant bg-surface gap-4">
              <Image
                className="w-16 h-16 rounded-xl"
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuABIFQWH5TBzUQgWtSJWvYY0hYnh9RUe4Vb9drHXIYGlcHZY5l46iGiXkJUUEnmZvj0rLW_DDitB5_SkOL75OkmhR1KDmpzk4tW3ZPfQOo1S_r0oCia3KF7RfPhVLsqzmCVu1shHYQnpfIqtI1AmmrUcJtfA-Ky1NFzYUOIbtEGtyZjmBomEyzrwu8fCkk-5wUUdFksPM6Oxig0SdcWS0TRJJ4nmFfedboKyZ5a3RFp_M8bxZSIrETZf71fdp9ghu_14wT9Y9ACagQ",
                }}
              />
              <View className="flex-1 gap-1">
                <View className="flex-row justify-between items-center gap-1">
                  <Text
                    className="text-base font-semibold text-on-surface flex-1"
                    numberOfLines={1}
                  >
                    Herb Roast Chicken
                  </Text>
                  <View className="px-3 py-1 rounded-full bg-secondary-container">
                    <Text className="text-xs font-medium text-on-secondary-container">
                      Preparing
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-sm text-on-surface-variant">
                    Qty: 3
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialIcons name="timer" size={14} color="#494551" />
                    <Text className="text-sm text-on-surface-variant ml-0.5">
                      12m ago
                    </Text>
                  </View>
                </View>
              </View>
              <View className="items-end gap-1 w-12">
                <Text className="text-xs font-semibold text-outline">80%</Text>
                <View className="w-full h-1 rounded-full overflow-hidden bg-surface-container-highest">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: "80%" }}
                  />
                </View>
              </View>
            </View>

            {/* Task Card 2 */}
            <View className="flex-row items-center p-4 rounded-2xl border border-outline-variant bg-surface gap-4">
              <Image
                className="w-16 h-16 rounded-xl"
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAqxxn4tvq5Yx0SShp0St3d_DiMF0UVeyIz-etI52TnWtrL9Tf8Kg8CMThplffwYFxTfi-LsgR-FWKcfT3LnKzmQeny-niJrFmVhI9mBnu8zD9M8WO2yAQqH1cPU2oZV5ZXiiOEwD1gBVUIMxRInryDpsRnlWW3ARJ6yDIB99cANKOtt8h-C6eR8n9Y4Q_uPI5AyS10laoWhv-h7Nm8_nBEQGVa9D3BL1wDhRG9UzfPyWIrz98ZgVW4m1mpyNjOqB8P-_McOy4shU",
                }}
              />
              <View className="flex-1 gap-1">
                <View className="flex-row justify-between items-center gap-1">
                  <Text
                    className="text-base font-semibold text-on-surface flex-1"
                    numberOfLines={1}
                  >
                    Classic Caesar
                  </Text>
                  <View className="px-3 py-1 rounded-full bg-secondary-container">
                    <Text className="text-xs font-medium text-on-secondary-container">
                      Plating
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-sm text-on-surface-variant">
                    Qty: 1
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialIcons name="timer" size={14} color="#494551" />
                    <Text className="text-sm text-on-surface-variant ml-0.5">
                      8m ago
                    </Text>
                  </View>
                </View>
              </View>
              <View className="items-end gap-1 w-12">
                <Text className="text-xs font-semibold text-outline">95%</Text>
                <View className="w-full h-1 rounded-full overflow-hidden bg-surface-container-highest">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: "95%" }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Quick Action FAB */}
      <TouchableOpacity
        style={{ bottom: insets.bottom + 90 }}
        className="absolute right-6 w-14 h-14 bg-primary rounded-2xl shadow-lg items-center justify-center z-50"
        activeOpacity={0.9}
      >
        <MaterialIcons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
