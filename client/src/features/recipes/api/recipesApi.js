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

export const recipesApi = {
  async list(params = {}) {
    const res = await http.get("/recipes", { params });
    return unwrap(res);
  },

  async get(id) {
    const res = await http.get(`/recipes/${id}`);
    return unwrap(res);
  },

  async create(input) {
    const res = await http.post("/recipes", input);
    return unwrap(res);
  },

  async update(id, input) {
    const res = await http.patch(`/recipes/${id}`, input);
    return unwrap(res);
  },

  async remove(id) {
    const res = await http.delete(`/recipes/${id}`);
    return unwrap(res);
  },

  async recalculateCost(id) {
    const res = await http.post(`/recipes/${id}/recalculate-cost`, {});
    return unwrap(res);
  },
};
