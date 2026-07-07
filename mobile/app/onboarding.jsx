import { useRef, useState } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ONBOARDING_KEY = "has_onboarded";

const SLIDES = [
  {
    emoji: "📊",
    title: "Real-Time Food Cost Insights",
    subtitle:
      "Track recipe costs, waste, and margins the moment they change — no more end-of-month surprises.",
  },
  {
    emoji: "🏨",
    title: "One App, Every Role",
    subtitle:
      "Chefs, reception, and managers each get a workspace built around their actual job.",
  },
  {
    emoji: "⚡",
    title: "Built for Busy Shifts",
    subtitle:
      "Fast PIN login and a layout designed to be used one-handed on the floor.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(newIndex);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (index + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Skip */}
      <Pressable
        onPress={finish}
        className="absolute top-14 right-6 z-10 px-3 py-1.5"
      >
        <Text className="text-on-surface-variant font-medium">Skip</Text>
      </Pressable>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 items-center justify-center px-10"
          >
            <View className="w-40 h-40 rounded-full bg-primary-container items-center justify-center mb-10">
              <Text style={{ fontSize: 64 }}>{slide.emoji}</Text>
            </View>
            <Text className="text-2xl font-bold text-on-surface text-center mb-3">
              {slide.title}
            </Text>
            <Text className="text-base text-on-surface-variant text-center leading-6">
              {slide.subtitle}
            </Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} />
        ))}
      </View>

      {/* CTA */}
      <View className="px-8 mb-12">
        <Pressable
          onPress={goNext}
          className="bg-primary rounded-2xl py-4 items-center active:opacity-90"
        >
          <Text className="text-on-primary font-semibold text-base">
            {index === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Dot({ index, scrollX }) {
  const style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [8, 24, 8],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4 }, style]}
      className="bg-primary"
    />
  );
}
