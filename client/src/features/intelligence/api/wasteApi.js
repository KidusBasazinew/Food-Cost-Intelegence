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

export const wasteApi = {
  async list(params = {}) {
    const res = await http.get("/waste", { params });
    return unwrap(res);
  },

  async report(params = {}) {
    const res = await http.get("/waste/report", { params });
    return unwrap(res);
  },

  async log(input) {
    const res = await http.post("/waste", input);
    return unwrap(res);
  },
};
