export const createHousekeepingValidation = (data) => {
  const errors = [];
  if (!data.roomId) errors.push("roomId is required");
  return { valid: errors.length === 0, errors };
};
