import { http } from "@/api/http";

export const workforceApi = {
  pin: ({ hotelId, pin, branchId }) =>
    http
      .post("/workforce/attendance/pin", { hotelId, pin, branchId })
      .then((r) => r.data.data),
  listEmployees: (params) =>
    http.get("/workforce/employees", { params }).then((r) => r.data.data),
  createEmployee: (input) =>
    http.post("/workforce/employees", input).then((r) => r.data.data),
  resetPin: (id, newPin) =>
    http
      .post(`/workforce/employees/${id}/reset-pin`, { newPin })
      .then((r) => r.data.data),
  updateEmployee: (id, input) =>
    http.patch(`/workforce/employees/${id}`, input).then((r) => r.data.data),
  disableEmployee: (id) =>
    http.patch(`/workforce/employees/${id}/disable`).then((r) => r.data),
  listShifts: () => http.get("/workforce/shifts").then((r) => r.data.data),
  createShift: (input) =>
    http.post("/workforce/shifts", input).then((r) => r.data.data),
  updateShift: (id, input) =>
    http.patch(`/workforce/shifts/${id}`, input).then((r) => r.data.data),
  deleteShift: (id) =>
    http.delete(`/workforce/shifts/${id}`).then((r) => r.data.data),
  employeeSummaries: (params) =>
    http.get("/workforce/reports/summary", { params }).then((r) => r.data.data),
};
