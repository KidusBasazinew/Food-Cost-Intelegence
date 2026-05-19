import { http } from "@/api/http";

function unwrap(res) {
  const payload = res?.data;
  if (!payload?.success) {
    const message = payload?.message || "Request failed";
    const errors = payload?.errors || [];
    const err = new Error(message);
    err.errors = errors;
    throw err;
  }
  return payload.data;
}

export const analyticsApi = {
  async executive(params = {}) {
    const res = await http.get("/analytics/executive", { params });
    return unwrap(res);
  },

  async foodCost(params = {}) {
    const res = await http.get("/analytics/food-cost", { params });
    return unwrap(res);
  },

  async menuEngineering(params = {}) {
    const res = await http.get("/analytics/menu-engineering", { params });
    return unwrap(res);
  },

  async waste(params = {}) {
    const res = await http.get("/analytics/waste", { params });
    return unwrap(res);
  },

  async inventoryForecast(params = {}) {
    const res = await http.get("/analytics/inventory/forecast", { params });
    return unwrap(res);
  },

  async suppliers(params = {}) {
    const res = await http.get("/analytics/suppliers", { params });
    return unwrap(res);
  },
};
