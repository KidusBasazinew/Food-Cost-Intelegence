import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

export function SearchBar({ value, onChangeText, placeholder = "Search..." }) {
  return (
    <View className="flex-row items-center bg-surface-container-high rounded-full h-12 px-4 mb-3">
      <Search size={18} color="#494551" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#79747E"
        className="font-regular flex-1 py-1 ml-3 text-sm text-on-surface"
      />
    </View>
  );
}
