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

export const consumptionApi = {
  async list(params = {}) {
    const res = await http.get("/inventory-consumption", { params });
    return unwrap(res);
  },

  async consumeRecipe(input) {
    const res = await http.post("/inventory-consumption/consume-recipe", input);
    return unwrap(res);
  },

  async report(params = {}) {
    const res = await http.get("/inventory-consumption/report", { params });
    return unwrap(res);
  },

  async velocity(params = {}) {
    const res = await http.get("/inventory-consumption/velocity", { params });
    return unwrap(res);
  },
};
