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

export const reportsApi = {
  async list() {
    const res = await http.get("/reports");
    return unwrap(res);
  },

  async export({ type, format = "csv", params = {} }) {
    const res = await http.get("/reports/export", {
      params: { type, format, ...params },
      responseType: "blob",
    });
    return res.data;
  },
};
