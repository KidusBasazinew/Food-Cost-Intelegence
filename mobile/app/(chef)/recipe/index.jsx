import { useState, useMemo } from "react";
import {
  View,
  ImageBackground,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import {
  Clock,
  DollarSign,
  ChevronRight,
  ChefHat,
  Plus,
} from "lucide-react-native";
import { recipes } from "../../../mock/recipes";
import { useAuth } from "../../../context/AuthContext";
import { Header } from "../../../components/Header";
import { SearchBar } from "../../../components/SearchBar";
import { FilterChips } from "../../../components/FilterChips";
import { RecipeCard } from "../../../components/RecipeCard";
import { FeaturedCarousel } from "../../../components/FeaturedCarousel";
import { formatETB } from "../../../utils/format";

const featuredList = [
  ...recipes.filter((r) => r.isFeatured),
  ...recipes.filter((r) => !r.isFeatured),
].slice(0, 3);

const CATEGORY_FILTERS = [
  { key: "ALL", label: "All Recipes" },
  { key: "APPETIZER", label: "Starters" },
  { key: "MAIN", label: "Mains" },
  { key: "DESSERT", label: "Desserts" },
  { key: "OTHER", label: "Sauces" },
];

export default function Recipe() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const featured = recipes.find((r) => r.isFeatured);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (r.isFeatured) return false; // shown separately in the hero card
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "ALL") return true;
      return r.category === filter;
    });
  }, [search, filter]);

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Recipe Book"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search for recipes..."
        />
        <FilterChips
          options={CATEGORY_FILTERS}
          active={filter}
          onChange={setFilter}
        />

        <FeaturedCarousel items={featuredList} />
        {/* Recipe grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}

          {/* Add new recipe placeholder */}
          <Pressable className="w-[47%] min-h-[180px] rounded-[20px] border-2 border-dashed border-outline-variant items-center justify-center p-4 active:bg-surface-container">
            <View className="w-11 h-11 rounded-full bg-secondary-container items-center justify-center mb-2">
              <Plus size={20} color="#4F378A" />
            </View>
            <Text className="font-normal text-xs text-on-surface-variant text-center">
              Add New Recipe
            </Text>
          </Pressable>
        </View>

        {filtered.length === 0 && (
          <View className="items-center py-10">
            <ChefHat size={28} color="#79747E" />
            <Text className="font-normal text-sm text-on-surface-variant mt-2">
              No recipes in this category.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        className="absolute right-6 bottom-6 w-14 h-14 bg-primary-container rounded-2xl items-center justify-center active:scale-95"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <ChevronRight size={10} color="#4F378A" />
      </Pressable>
    </View>
  );
}
