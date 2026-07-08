import {
  View,
  Text,
  Pressable,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Clock, DollarSign, ChevronRight } from "lucide-react-native";
import { formatETB } from "../utils/format";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.25;

function FeaturedSlide({ item }) {
  return (
    <View style={{ width: CARD_WIDTH, height: "100%" }}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        className="w-full h-full justify-end p-4"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/35" />
        <View className="self-start bg-tertiary-fixed px-2 py-1 rounded mb-2 z-10">
          <Text className="font-semibold text-[10px] uppercase text-on-tertiary-fixed">
            Chef's Choice
          </Text>
        </View>
        <Text className="font-semibold text-xl text-white z-10">
          {item.name}
        </Text>
        <View className="flex-row items-center gap-4 mt-1.5 z-10">
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#FFFFFF" />
            <Text className="font-normal text-xs text-white/90">
              {item.prepMinutes}m
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <DollarSign size={14} color="#FFFFFF" />
            <Text className="font-normal text-xs text-white/90">
              {formatETB(item.sellingPriceCents)}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export function FeaturedCarousel({ items }) {
  if (items.length === 0) return null;

  // Append a clone of the first slide at the end — landing on it looks identical
  // to real slide 0, so we can silently reset the track there with no visible jump.
  const loopItems = items.length > 1 ? [...items, items[0]] : items;

  const slideIndex = useSharedValue(0);
  const trackX = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const handleSettled = (landedIndex) => {
    "worklet";
    if (items.length > 1 && landedIndex === items.length) {
      // We're sitting on the cloned slide — snap back to the real slide 0, no animation
      slideIndex.value = 0;
      trackX.value = 0;
    } else {
      slideIndex.value = landedIndex;
    }
    isAnimating.value = false;
  };

  const snapToIndex = (index) => {
    "worklet";
    isAnimating.value = true;
    trackX.value = withTiming(
      -index * CARD_WIDTH,
      { duration: 300 },
      (finished) => {
        if (finished) handleSettled(index);
      },
    );
  };

  const goNext = () => {
    "worklet";
    if (isAnimating.value || items.length < 2) return;
    snapToIndex(slideIndex.value + 1);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      if (isAnimating.value) return;
      const base = -slideIndex.value * CARD_WIDTH;
      trackX.value = base + Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (isAnimating.value) return;
      if (e.translationX < -SWIPE_THRESHOLD) {
        goNext();
      } else {
        snapToIndex(slideIndex.value); // spring back to current slide
      }
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View className="w-full h-52 relative overflow-hidden rounded-[20px]">
        <Animated.View
          style={[{ flexDirection: "row", height: "100%" }, trackStyle]}
        >
          {loopItems.map((item, i) => (
            <FeaturedSlide key={`${item.id}-${i}`} item={item} />
          ))}
        </Animated.View>

        {items.length > 1 && (
          <Pressable
            onPress={goNext}
            className="absolute right-4 bottom-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center z-30 active:scale-90"
            style={{
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <ChevronRight size={18} color="#1F1B24" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
    </GestureDetector>
  );
}
