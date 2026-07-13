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

export const inventoryApi = {
  async listItems(params = {}) {
    const res = await http.get("/inventory", { params });
    return unwrap(res);
  },

  async getItem(id) {
    const res = await http.get(`/inventory/${id}`);
    return unwrap(res);
  },

  async createItem(input) {
    const res = await http.post("/inventory", input);
    return unwrap(res);
  },

  async updateItem(id, input) {
    const res = await http.patch(`/inventory/${id}`, input);
    return unwrap(res);
  },

  async deleteItem(id) {
    const res = await http.delete(`/inventory/${id}`);
    return unwrap(res);
  },

  async listTransactions(params = {}) {
    const res = await http.get("/inventory/transactions", { params });
    return unwrap(res);
  },

  async createTransaction(input) {
    const res = await http.post("/inventory/transactions", input);
    return unwrap(res);
  },
};
