import { http } from "@/api/http";

function unwrap(res) {
  const payload = res?.data;
  if (!payload?.success) {
    const message = payload?.message || "Request failed";
    const err = new Error(message);
    err.errors = payload?.errors || [];
    throw err;
  }
  return payload.data;
}

export const leakageApi = {
  async dashboard(params = {}) {
    const res = await http.get("/leakage/dashboard", { params });
    return unwrap(res);
  },
};
