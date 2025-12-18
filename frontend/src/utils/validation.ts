/**
 * Form Validation Utilities
 * Reusable validation functions for forms
 */

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic validation - starts with + and has at least 10 digits
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return { 
      isValid: false, 
      error: 'Phone must start with + and include country code (e.g., +1234567890)' 
    };
  }

  return { isValid: true };
};

/**
 * Validate OTP code
 */
export const validateOTP = (otp: string): { isValid: boolean; error?: string } => {
  if (!otp) {
    return { isValid: false, error: 'OTP code is required' };
  }

  if (otp.length !== 6) {
    return { isValid: false, error: 'OTP must be 6 digits' };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: 'OTP must contain only numbers' };
  }

  return { isValid: true };
};

/**
 * Validate display name
 */
export const validateDisplayName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Display name must not exceed 50 characters' };
  }

  return { isValid: true };
};

/**
 * Validate bio/description
 */
export const validateBio = (bio: string, maxLength: number = 500): { isValid: boolean; error?: string } => {
  if (bio && bio.length > maxLength) {
    return { isValid: false, error: `Bio must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
};

/**
 * Validate hourly rate
 */
export const validateHourlyRate = (rate: number | undefined): { isValid: boolean; error?: string } => {
  if (rate === undefined) {
    return { isValid: true }; // Optional field
  }

  if (rate < 0) {
    return { isValid: false, error: 'Hourly rate cannot be negative' };
  }

  if (rate > 10000) {
    return { isValid: false, error: 'Hourly rate seems unreasonably high' };
  }

  return { isValid: true };
};

/**
 * Validate service radius
 */
export const validateServiceRadius = (radius: number): { isValid: boolean; error?: string } => {
  if (radius < 1) {
    return { isValid: false, error: 'Service radius must be at least 1 km' };
  }

  if (radius > 100) {
    return { isValid: false, error: 'Service radius cannot exceed 100 km' };
  }

  return { isValid: true };
};
