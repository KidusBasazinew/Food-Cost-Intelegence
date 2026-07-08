const today = new Date();
const atHour = (dayOffset, hour, min = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const reservations = [
  {
    id: "res1",
    roomId: "rm1",
    guestName: "Liya Bekele",
    guestPhone: "0911223344",
    status: "CHECKED_IN",
    checkInAt: atHour(-1, 14, 0),
    checkOutAt: atHour(1, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: null,
  },
  {
    id: "res2",
    roomId: "rm6",
    guestName: "Samuel Tesfaye",
    guestPhone: "0922334455",
    status: "CHECKED_IN",
    checkInAt: atHour(-2, 15, 0),
    checkOutAt: atHour(0, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: "Requested late checkout",
  },
  {
    id: "res3",
    roomId: "rm9",
    guestName: "Hana Girma",
    guestPhone: "0933445566",
    status: "CHECKED_IN",
    checkInAt: atHour(-3, 13, 0),
    checkOutAt: atHour(0, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: null,
  },
  {
    id: "res4",
    roomId: "rm2",
    guestName: "Yosef Alemu",
    guestPhone: "0944556677",
    status: "RESERVED",
    checkInAt: atHour(0, 15, 0),
    checkOutAt: atHour(2, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: null,
  },
  {
    id: "res5",
    roomId: "rm8",
    guestName: "Marta Solomon",
    guestPhone: "0955667788",
    status: "RESERVED",
    checkInAt: atHour(0, 16, 30),
    checkOutAt: atHour(3, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: "Airport pickup requested",
  },
  {
    id: "res6",
    roomId: "rm12",
    guestName: "Dawit Mekonnen",
    guestPhone: "0966778899",
    status: "RESERVED",
    checkInAt: atHour(1, 14, 0),
    checkOutAt: atHour(4, 12, 0),
    actualCheckOutAt: null,
    lateCheckoutFeeCents: 0,
    notes: null,
  },
  {
    id: "res7",
    roomId: "rm5",
    guestName: "Ruth Abebe",
    guestPhone: "0977889900",
    status: "CHECKED_OUT",
    checkInAt: atHour(-4, 14, 0),
    checkOutAt: atHour(-1, 12, 0),
    actualCheckOutAt: atHour(-1, 11, 40),
    lateCheckoutFeeCents: 0,
    notes: null,
  },
];

export function reservationById(id) {
  return reservations.find((r) => r.id === id);
}

export function todaysArrivals() {
  const now = new Date();
  return reservations.filter((r) => {
    const checkIn = new Date(r.checkInAt);
    return (
      r.status === "RESERVED" && checkIn.toDateString() === now.toDateString()
    );
  });
}

export function todaysDepartures() {
  const now = new Date();
  return reservations.filter((r) => {
    const checkOut = new Date(r.checkOutAt);
    return (
      r.status === "CHECKED_IN" &&
      checkOut.toDateString() === now.toDateString()
    );
  });
}
