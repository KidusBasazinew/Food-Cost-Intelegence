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

export const measurementUnitsApi = {
  async list() {
    const res = await http.get("/measurement-units");
    return unwrap(res);
  },

  async getById(id) {
    const res = await http.get(`/measurement-units/${id}`);
    return unwrap(res);
  },

  async create(input) {
    const res = await http.post("/measurement-units", input);
    return unwrap(res);
  },

  async update(id, input) {
    const res = await http.patch(`/measurement-units/${id}`, input);
    return unwrap(res);
  },

  async remove(id) {
    const res = await http.delete(`/measurement-units/${id}`);
    return unwrap(res);
  },
};
