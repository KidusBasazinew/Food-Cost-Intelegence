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

export const purchasesApi = {
  async list(params = {}) {
    const res = await http.get("/purchases", { params });
    return unwrap(res);
  },

  async getById(id) {
    const res = await http.get(`/purchases/${id}`);
    return unwrap(res);
  },

  async create(input) {
    const res = await http.post("/purchases", input);
    return unwrap(res);
  },

  async update(id, input) {
    const res = await http.patch(`/purchases/${id}`, input);
    return unwrap(res);
  },
};
