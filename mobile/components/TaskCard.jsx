import { View, Text, Pressable } from "react-native";
import { DoorOpen, User } from "lucide-react-native";
import { roomById } from "../mock/rooms";
import { elapsedLabel } from "../utils/format";
import {
  TASK_STATUS_STYLES,
  TASK_KIND_STYLES,
  NEXT_TASK_ACTION_LABEL,
} from "../utils/housekeepingStatus";

export function TaskCard({ task, onAdvance, onAssign }) {
  const room = roomById(task.roomId);
  const statusStyle = TASK_STATUS_STYLES[task.status];
  const kindStyle = TASK_KIND_STYLES[task.kind];
  const KindIcon = kindStyle.icon;
  const nextLabel = NEXT_TASK_ACTION_LABEL[task.status];

  return (
    <View className="bg-surface-container-low rounded-2xl p-4 mb-3 border border-outline-variant/20">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-xl bg-secondary-container items-center justify-center">
            <KindIcon size={18} color={kindStyle.color} />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="font-semibold text-sm text-on-surface">
                Room {room?.roomNumber}
              </Text>
            </View>
            <Text className="font-regular text-xs text-on-surface-variant mt-0.5">
              {kindStyle.label} · {elapsedLabel(task.createdAt)}
            </Text>
          </View>
        </View>

        <View
          className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyle.bg}`}
        >
          <Text className={`font-semibold text-xs ${statusStyle.text}`}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {task.notes && (
        <View className="bg-amber-50 rounded-lg px-3 py-2 mb-3">
          <Text className="font-regular text-xs text-amber-800">
            {task.notes}
          </Text>
        </View>
      )}

      {/* Assignment row */}
      <Pressable
        onPress={() => onAssign(task.id)}
        className="flex-row items-center gap-2 mb-3 active:opacity-70"
      >
        <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
          <User size={12} color="#4F378A" />
        </View>
        <Text className="font-regular text-xs text-on-surface-variant">
          {task.assignedUserName ?? "Unassigned — tap to assign"}
        </Text>
      </Pressable>

      {nextLabel && task.assignedUserName && (
        <Pressable
          onPress={() => onAdvance(task.id)}
          className="bg-primary rounded-xl py-2.5 items-center active:opacity-90"
        >
          <Text className="font-semibold text-sm text-on-primary">
            {nextLabel}
          </Text>
        </Pressable>
      )}

      {nextLabel && !task.assignedUserName && (
        <View className="bg-surface-container-highest rounded-xl py-2.5 items-center">
          <Text className="font-semibold text-sm text-on-surface-variant">
            Assign staff to begin
          </Text>
        </View>
      )}
    </View>
  );
}
