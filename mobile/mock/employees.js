// Note: schema's EmployeeRole enum is uppercase (CHEF, RECEPTION, MANAGER...).
// We keep a lowercase `role` for app routing (matches our (chef)/(reception)/(manager) route groups)
// since that's what Expo Router's folder names use. When you wire the real API,
// map EmployeeRole -> route role in one place (see roleToRoute below).

export const employees = [
  {
    id: "1",
    hotelId: "h1",
    branchId: "b1",
    shiftId: "s1",
    employeeCode: "EMP001",
    firstName: "Abel",
    lastName: "Tesfaye",
    role: "chef",
    phone: "0911000001",
    pinCode: "1111",
    hireDate: "2023-01-10",
    isActive: true,
  },
  {
    id: "2",
    hotelId: "h1",
    branchId: "b1",
    shiftId: "s2",
    employeeCode: "EMP002",
    firstName: "Selam",
    lastName: "Girma",
    role: "reception",
    phone: "0911000002",
    pinCode: "2222",
    hireDate: "2023-03-15",
    isActive: true,
  },
  {
    id: "3",
    hotelId: "h1",
    branchId: "b1",
    shiftId: "s1",
    employeeCode: "EMP003",
    firstName: "Dawit",
    lastName: "Alemu",
    role: "manager",
    phone: "0911000003",
    pinCode: "3333",
    hireDate: "2022-11-01",
    isActive: true,
  },
];

export const shifts = {
  s1: { id: "s1", name: "Morning Shift", startTime: "06:00", endTime: "14:00" },
  s2: { id: "s2", name: "Day Shift", startTime: "09:00", endTime: "17:00" },
};

export function roleToRoute(schemaRole) {
  const map = {
    CHEF: "chef",
    RECEPTION: "reception",
    MANAGER: "manager",
    HOUSEKEEPING: "operations",
    WAITER: "chef",
    CASHIER: "reception",
    STORE_KEEPER: "chef",
    SECURITY: "operations",
    MAINTENANCE: "operations",
    OTHER: "reception",
  };
  return map[schemaRole] ?? "reception";
}
