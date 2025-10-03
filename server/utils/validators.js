// utils/validators.js

// Safety check: ensures required fields are not null/undefined/empty/default
export const validateRequestBody = (body, requiredFields = []) => {
  for (let field of requiredFields) {
    const value = body[field];

    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && value === 0)
    ) {
      return { valid: false, message: `${field} is missing or invalid` };
    }
  }

  return { isValid: true };
};
