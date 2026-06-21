import { http } from "@/api/http";

function unwrap(res) {
  const payload = res?.data;
  if (!payload?.success) {
    const msg = payload?.message || "Request failed";
    const err = new Error(msg);
    err.data = payload;
    throw err;
  }
  return payload.data;
}

export const posService = {
  createDraftOrder(input) {
    return http.post("/pos/orders/draft", input).then(unwrap);
  },
  sendToKitchen(input) {
    console.log(input);
    return http.post("/pos/orders/send-to-kitchen", input).then(unwrap);
  },
  updateStatus(orderId, status) {
    return http.patch(`/pos/orders/${orderId}/status`, { status }).then(unwrap);
  },
  updateOrder(orderId, input) {
    return http.patch(`/pos/orders/${orderId}`, input).then(unwrap);
  },
  listKitchen(params) {
    return http.get("/pos/kitchen", { params }).then(unwrap);
  },
  listOrders(params) {
    return http.get("/pos/orders", { params }).then(unwrap);
  },
  getOrder(id) {
    return http.get(`/pos/orders/${id}`).then(unwrap);
  },
  listTables() {
    return http.get("/pos/tables").then(unwrap);
  },
  todayAnalytics() {
    return http.get("/pos/analytics/today").then(unwrap);
  },
};
