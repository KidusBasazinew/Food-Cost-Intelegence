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

export const foodCostApi = {
  async report(params = {}) {
    const res = await http.get("/food-cost", { params });
    return unwrap(res);
  },
};
