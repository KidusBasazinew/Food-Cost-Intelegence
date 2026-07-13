import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { X } from "lucide-react-native";
import {
  housekeepingTasks as initialTasks,
  HOUSEKEEPING_STAFF,
} from "../../mock/housekeepingTasks";
import {
  NEXT_TASK_STATUS,
  TASK_KIND_STYLES,
} from "../../utils/housekeepingStatus";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import { SearchBar } from "../../components/SearchBar";
import { FilterChips } from "../../components/FilterChips";
import { TaskCard } from "../../components/TaskCard";
import { roomById } from "../../mock/rooms";

const KIND_FILTERS = [
  { key: "ALL", label: "All Tasks" },
  { key: "CLEANING", label: "Cleaning" },
  { key: "MAINTENANCE", label: "Maintenance" },
  { key: "INSPECTION", label: "Inspection" },
];

const STATUS_FILTERS = [
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "CLEANED", label: "Cleaned" },
  { key: "VERIFIED", label: "Verified" },
];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [assignTaskId, setAssignTaskId] = useState(null);

  const handleAdvance = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !NEXT_TASK_STATUS[t.status]) return t;
        const nextStatus = NEXT_TASK_STATUS[t.status];
        const updates = { status: nextStatus };
        const now = new Date().toISOString();
        if (nextStatus === "IN_PROGRESS") updates.checkedInAt = now;
        if (nextStatus === "CLEANED") updates.completedAt = now;
        if (nextStatus === "VERIFIED") updates.verifiedAt = now;
        return { ...t, ...updates };
      }),
    );
  };

  const handleAssignStaff = (staffId, staffName) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === assignTaskId
          ? { ...t, assignedUserId: staffId, assignedUserName: staffName }
          : t,
      ),
    );
    setAssignTaskId(null);
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const kindMatch = kindFilter === "ALL" || t.kind === kindFilter;
      if (!kindMatch) return false;
      const statusMatch =
        statusFilter === "ACTIVE"
          ? ["PENDING", "IN_PROGRESS"].includes(t.status)
          : t.status === statusFilter;
      if (!statusMatch) return false;
      if (!search) return true;
      const room = roomById(t.roomId);
      return room?.roomNumber.includes(search);
    });
  }, [tasks, search, kindFilter, statusFilter]);

  return (
    <View className="flex-1 bg-background">
      <Header
        user={user}
        title="Housekeeping"
        initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      />

      <View className="px-4 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by room number..."
        />
        <FilterChips
          options={KIND_FILTERS}
          active={kindFilter}
          onChange={setKindFilter}
        />
        <FilterChips
          options={STATUS_FILTERS}
          active={statusFilter}
          onChange={setStatusFilter}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Text className="font-normal text-sm text-on-surface-variant">
              No tasks match.
            </Text>
          </View>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAdvance={handleAdvance}
              onAssign={(id) => setAssignTaskId(id)}
            />
          ))
        )}
      </ScrollView>

      {/* Assign staff bottom sheet */}
      <Modal
        visible={!!assignTaskId}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignTaskId(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setAssignTaskId(null)}
        >
          <Pressable
            className="bg-surface-container-low rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-base text-on-surface">
                Assign Staff
              </Text>
              <Pressable
                onPress={() => setAssignTaskId(null)}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={20} color="#494551" />
              </Pressable>
            </View>
            {HOUSEKEEPING_STAFF.map((staff) => (
              <Pressable
                key={staff.id}
                onPress={() => handleAssignStaff(staff.id, staff.name)}
                className="flex-row items-center gap-3 py-3 active:opacity-70"
              >
                <View className="w-9 h-9 rounded-full bg-secondary-container items-center justify-center">
                  <Text className="font-semibold text-xs text-secondary">
                    {staff.name[0]}
                  </Text>
                </View>
                <Text className="font-normal text-sm text-on-surface">
                  {staff.name}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
