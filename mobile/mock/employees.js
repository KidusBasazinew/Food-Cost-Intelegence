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
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx7F_T557LlBGz4FG5_nQMY1-cvSBGC1--b4XHJa6LdZIphdWXXtWooWrT&s=10",
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
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTZNrSW2JTyoN8wMJW2Ae8QYLGQSQpEtWa4_Y1Y4WQuA&s=10",
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
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREzT3ktfHwC55ycKWOsVnrNXMr997n82Q5VDvYk02CLg&s=10",
    pinCode: "3333",
    hireDate: "2022-11-01",
    isActive: true,
  },
  {
    id: "4",
    hotelId: "h1",
    branchId: "b1",
    shiftId: "s1",
    employeeCode: "EMP004",
    firstName: "Betelhem",
    lastName: "Kassa",
    role: "storecount",
    phone: "0911000004",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREzT3ktfHwC55ycKWOsVnrNXMr997n82Q5VDvYk02CLg&s=10",
    pinCode: "4444",
    hireDate: "2023-06-01",
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
    HOUSEKEEPING: "reception",
    WAITER: "chef",
    CASHIER: "reception",
    STORE_KEEPER: "storecount",
    SECURITY: "reception",
    MAINTENANCE: "reception",
    OTHER: "reception",
  };
  return map[schemaRole] ?? "reception";
}
