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

export const authApi = {
  async login({ email, password }) {
    const res = await http.post("/auth/login", { email, password });
    return unwrap(res);
  },

  async logout() {
    const res = await http.post("/auth/logout");
    return unwrap(res);
  },

  async refresh() {
    const res = await http.post("/auth/refresh", {});
    return unwrap(res);
  },

  async me() {
    const res = await http.get("/auth/me");
    return unwrap(res);
  },
};
