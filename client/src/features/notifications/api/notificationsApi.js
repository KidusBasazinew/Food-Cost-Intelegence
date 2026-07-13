import { http } from "@/api/http";

function unwrap(res) {
  const payload = res?.data;
  if (!payload?.success) {
    throw new Error(payload?.message || "Request failed");
  }
  return payload.data;
}

export const notificationsApi = {
  async list(params = {}) {
    const res = await http.get("/notifications", { params });
    return unwrap(res);
  },

  async unreadCount(params = {}) {
    const res = await http.get("/notifications/unread-count", { params });
    return unwrap(res);
  },

  async markRead(id) {
    const res = await http.patch(`/notifications/${id}/read`, {});
    return unwrap(res);
  },

  async markAllRead() {
    const res = await http.patch("/notifications/read-all", {});
    return unwrap(res);
  },
};
