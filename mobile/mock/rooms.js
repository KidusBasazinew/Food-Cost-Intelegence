export const rooms = [
  { id: "rm1", roomNumber: "101", floor: 1, status: "OCCUPIED" },
  { id: "rm2", roomNumber: "102", floor: 1, status: "VACANT" },
  { id: "rm3", roomNumber: "103", floor: 1, status: "DIRTY" },
  { id: "rm4", roomNumber: "104", floor: 1, status: "CLEANING" },
  { id: "rm5", roomNumber: "201", floor: 2, status: "READY" },
  { id: "rm6", roomNumber: "202", floor: 2, status: "OCCUPIED" },
  { id: "rm7", roomNumber: "203", floor: 2, status: "INSPECTING" },
  { id: "rm8", roomNumber: "204", floor: 2, status: "VACANT" },
  { id: "rm9", roomNumber: "301", floor: 3, status: "OCCUPIED" },
  { id: "rm10", roomNumber: "302", floor: 3, status: "OUT_OF_SERVICE" },
  { id: "rm11", roomNumber: "303", floor: 3, status: "READY" },
  { id: "rm12", roomNumber: "304", floor: 3, status: "VACANT" },
];

export function roomById(id) {
  return rooms.find((r) => r.id === id);
}
