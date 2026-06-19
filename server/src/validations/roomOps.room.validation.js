export const createRoomValidation = (data) => {
  const errors = [];
  if (!data.roomNumber) errors.push("roomNumber is required");
  if (data.floor !== undefined && typeof data.floor !== "number")
    errors.push("floor must be a number");
  return { valid: errors.length === 0, errors };
};
