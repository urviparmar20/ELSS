import { ValidateFormParams } from "../types/breakdownCheckout";


export const validateForm = (params: ValidateFormParams): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const {
    equipmentTypeId,
    equipmentId,
    location,
    status,
    date,
    loginTime,
    logoutTime,
  } = params;

  // ---- COMMON ----
  if (!equipmentTypeId) errors.push("Equipment type is required");
  if (!equipmentId) errors.push("Equipment ID is required");
  if (!location.trim()) errors.push("Location is required");
  if (!status) errors.push("Status is required");
  if (!date) errors.push("Date is required");

  // Time validation
  if (loginTime && logoutTime) {
    const [loginHour, loginMinute] = loginTime.split(":").map(Number);
    const [logoutHour, logoutMinute] = logoutTime.split(":").map(Number);

    const loginTotalMinutes = loginHour * 60 + loginMinute;
    const logoutTotalMinutes = logoutHour * 60 + logoutMinute;

    if (logoutTotalMinutes < loginTotalMinutes) {
      errors.push("Logout time cannot be earlier than login time");
    }
  }
  

  return { valid: errors.length === 0, errors };
};
