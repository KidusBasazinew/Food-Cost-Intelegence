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

export const suppliersApi = {
  async list() {
    const res = await http.get("/suppliers");
    return unwrap(res);
  },

  async create(input) {
    const res = await http.post("/suppliers", input);
    return unwrap(res);
  },

  async update(id, input) {
    const res = await http.patch(`/suppliers/${id}`, input);
    return unwrap(res);
  },

  async remove(id) {
    const res = await http.delete(`/suppliers/${id}`);
    return unwrap(res);
  },
};
