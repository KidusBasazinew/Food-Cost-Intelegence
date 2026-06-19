import { http } from "@/api/http";

// 1. Add the unwrap helper function
function unwrap(res) {
  const payload = res?.data;
  // If response uses the standard envelope { success, message, data }
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "success")
  ) {
    if (!payload.success) {
      const message = payload?.message || "Request failed";
      const errors = payload?.errors || [];
      const err = new Error(message);
      err.errors = errors;
      throw err;
    }
    return payload.data; // Returns inner data
  }

  // Fallback: accept raw responses (no envelope)
  return payload;
}

export const roomOpsApi = {
  async listRooms(params = {}) {
    const res = await http.get("/ops/rooms", { params });
    return unwrap(res); // 2. Wrap all returns in unwrap()
  },
  async createRoom(input) {
    console.log(input);
    const res = await http.post("/ops/rooms", input);
    return unwrap(res);
  },
  async getRoom(id) {
    const res = await http.get(`/ops/rooms/${id}`);
    return unwrap(res);
  },
  async updateRoom(id, input) {
    const res = await http.put(`/ops/rooms/${id}`, input);
    return unwrap(res);
  },
  async deleteRoom(id) {
    const res = await http.delete(`/ops/rooms/${id}`);
    return unwrap(res);
  },
  async listReservations(params = {}) {
    const res = await http.get("/ops/reservations", { params });
    return unwrap(res);
  },
  async createReservation(input) {
    const res = await http.post("/ops/reservations", input);
    return unwrap(res);
  },
  async getReservation(id) {
    const res = await http.get(`/ops/reservations/${id}`);
    return unwrap(res);
  },
  async checkInReservation(id) {
    const res = await http.patch(`/ops/reservations/${id}/checkin`);
    return unwrap(res);
  },
  async checkOutReservation(id) {
    const res = await http.patch(`/ops/reservations/${id}/checkout`);
    return unwrap(res);
  },
  async listHousekeepingTasks(params = {}) {
    const res = await http.get("/ops/housekeeping/tasks", { params });
    return unwrap(res);
  },
  async createHousekeepingTask(input) {
    const res = await http.post("/ops/housekeeping/tasks", input);
    return unwrap(res);
  },
  async startHousekeepingTask(taskId) {
    const res = await http.patch(`/ops/housekeeping/tasks/${taskId}/start`);
    return unwrap(res);
  },
  async completeHousekeepingTask(taskId) {
    const res = await http.patch(`/ops/housekeeping/tasks/${taskId}/complete`);
    return unwrap(res);
  },
  async verifyHousekeepingTask(taskId) {
    const res = await http.patch(`/ops/housekeeping/tasks/${taskId}/verify`);
    return unwrap(res);
  },
  async detectLateCheckouts() {
    const res = await http.post("/ops/late-checkout/detect");
    return unwrap(res);
  },
  async listLateCheckouts() {
    const res = await http.get("/ops/late-checkout/list");
    return unwrap(res);
  },
};
