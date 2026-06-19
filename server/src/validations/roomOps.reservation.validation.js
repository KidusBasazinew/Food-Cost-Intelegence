export const createReservationValidation = (data) => {
  const errors = [];
  if (!data.roomId) errors.push("roomId is required");
  if (!data.guestName) errors.push("guestName is required");
  if (data.checkInAt && isNaN(new Date(data.checkInAt).getTime()))
    errors.push("checkInAt invalid");
  if (data.checkOutAt && isNaN(new Date(data.checkOutAt).getTime()))
    errors.push("checkOutAt invalid");
  return { valid: errors.length === 0, errors };
};
