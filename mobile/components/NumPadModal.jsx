import { useState } from "react";
import { View, Text, Pressable, Modal, Image } from "react-native";
import { X, Delete, Check, AlertTriangle } from "lucide-react-native";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function NumPadModal({ visible, item, onClose, onSubmit }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  if (!item) return null;

  const handleKey = (key) => {
    setError("");
    if (key === "back") return setValue((v) => v.slice(0, -1));
    if (key === "." && value.includes(".")) return;
    if (value.length >= 7) return;
    setValue((v) => v + key);
  };

  const handleConfirm = () => {
    const physicalQuantity = parseFloat(value);
    if (isNaN(physicalQuantity) || value === "") {
      setError("Enter a value first");
      return;
    }
    if (physicalQuantity > item.systemQuantity) {
      setError(
        `That's above system stock (${item.systemQuantity} ${item.unit})`,
      );
      return;
    }
    onSubmit(item.id, physicalQuantity);
    setValue("");
    setError("");
    setImageFailed(false);
  };

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={handleClose}
      >
        <Pressable
          className="bg-surface-container-low rounded-t-3xl p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-xl bg-surface-container-high items-center justify-center overflow-hidden">
                {!imageFailed ? (
                  <Image
                    source={{ uri: item.iconUrl }}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                    onError={() => setImageFailed(true)}
                  />
                ) : null}
              </View>
              <View>
                <Text className="font-semibold text-base text-on-surface">
                  {item.name}
                </Text>
                <Text className="font-normal text-xs text-on-surface-variant">
                  System stock: {item.systemQuantity} {item.unit}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleClose}
              className="w-9 h-9 items-center justify-center"
            >
              <X size={20} color="#494551" />
            </Pressable>
          </View>

          <View className="bg-surface-container-high rounded-2xl py-5 items-center mb-2">
            <Text className="font-semibold text-3xl text-on-surface">
              {value || "0"}{" "}
              <Text className="font-normal text-base text-on-surface-variant">
                {item.unit}
              </Text>
            </Text>
          </View>

          {error ? (
            <View className="flex-row items-center gap-2 bg-error-container rounded-xl px-3 py-2 mb-2">
              <AlertTriangle size={16} color="#93000A" />
              <Text className="font-normal text-xs text-on-error-container flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap justify-between mt-2">
            {KEYS.map((key) => (
              <Pressable
                key={key}
                onPress={() => handleKey(key)}
                className="w-[31%] h-14 rounded-2xl bg-surface-container-high items-center justify-center mb-3 active:bg-surface-variant"
              >
                {key === "back" ? (
                  <Delete size={20} color="#494551" />
                ) : (
                  <Text className="font-semibold text-xl text-on-surface">
                    {key}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleConfirm}
            className="bg-primary rounded-2xl py-3.5 items-center flex-row justify-center gap-2 mt-1"
          >
            <Check size={18} color="#FFFFFF" />
            <Text className="font-semibold text-sm text-on-primary">
              Confirm Count
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
