import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  validateOTP,
  validateDisplayName,
  validateBio,
  validateHourlyRate,
  validateServiceRadius,
} from '../validation';

describe('validation utilities', () => {
  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '+12345678901',
        '+123456789012',
        '+1234567890123',
        '+12345678901234',
        '+123456789012345',
      ];

      validPhones.forEach((phone) => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject phone numbers without + prefix', () => {
      const result = validatePhone('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone must start with + and include country code (e.g., +1234567890)');
    });

    it('should reject phone numbers that are too short', () => {
      const result = validatePhone('+123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone must start with + and include country code (e.g., +1234567890)');
    });

    it('should reject phone numbers that are too long', () => {
      const result = validatePhone('+1234567890123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone must start with + and include country code (e.g., +1234567890)');
    });

    it('should reject phone numbers with non-numeric characters', () => {
      const invalidPhones = ['+123abc7890', '+123-456-7890', '+123 456 7890'];
      
      invalidPhones.forEach((phone) => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Phone must start with + and include country code (e.g., +1234567890)');
      });
    });

    it('should reject empty phone numbers', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });

  describe('validateOTP', () => {
    it('should validate correct 6-digit OTP', () => {
      const validOTPs = ['123456', '000000', '999999', '654321'];

      validOTPs.forEach((otp) => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject OTP that is not 6 digits', () => {
      const invalidOTPs = ['12345', '1234567', '123', ''];

      invalidOTPs.forEach((otp) => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(false);
        expect(result.error).toMatch(/OTP|required/);
      });
    });

    it('should reject OTP with non-numeric characters', () => {
      const invalidOTPs = ['12345a', '123abc', '12-45-6', '12 34 56'];

      invalidOTPs.forEach((otp) => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(false);
        expect(result.error).toMatch(/OTP/);
      });
    });
  });

  describe('validateDisplayName', () => {
    it('should validate correct display names', () => {
      const validNames = ['John', 'Jane Doe', 'Alice Smith-Johnson', "O'Brien"];

      validNames.forEach((name) => {
        const result = validateDisplayName(name);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty or too short display names', () => {
      const result1 = validateDisplayName('');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Display name must be at least 2 characters');

      const result2 = validateDisplayName('A');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Display name must be at least 2 characters');
    });

    it('should reject display names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = validateDisplayName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Display name must not exceed 50 characters');
    });

    it('should trim whitespace from display names', () => {
      const result = validateDisplayName('  John  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateBio', () => {
    it('should validate correct bios', () => {
      const validBios = [
        'Short bio',
        'This is a longer bio with multiple sentences. It describes the person in detail.',
        '',
      ];

      validBios.forEach((bio) => {
        const result = validateBio(bio);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject bios that are too long', () => {
      const longBio = 'A'.repeat(501);
      const result = validateBio(longBio);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bio must not exceed 500 characters');
    });

    it('should accept empty bio (optional field)', () => {
      const result = validateBio('');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept exactly 500 characters', () => {
      const maxBio = 'A'.repeat(500);
      const result = validateBio(maxBio);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateHourlyRate', () => {
    it('should validate correct hourly rates', () => {
      const validRates = [10, 15.5, 50, 100, 500, 1000];

      validRates.forEach((rate) => {
        const result = validateHourlyRate(rate);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should accept undefined rate (optional field)', () => {
      const result = validateHourlyRate(undefined);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept zero and low rates', () => {
      const result = validateHourlyRate(0);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject extremely high rates', () => {
      const result = validateHourlyRate(10001);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Hourly rate seems unreasonably high');
    });

    it('should reject negative rates', () => {
      const result = validateHourlyRate(-10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Hourly rate cannot be negative');
    });
  });

  describe('validateServiceRadius', () => {
    it('should validate correct service radii', () => {
      const validRadii = [1, 5, 10, 25, 50, 100];

      validRadii.forEach((radius) => {
        const result = validateServiceRadius(radius);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject radius below minimum', () => {
      const result = validateServiceRadius(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Service radius must be at least 1 km');
    });

    it('should reject radius above maximum', () => {
      const result = validateServiceRadius(101);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Service radius cannot exceed 100 km');
    });

    it('should accept minimum radius', () => {
      const result = validateServiceRadius(1);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept maximum radius', () => {
      const result = validateServiceRadius(100);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject negative radius', () => {
      const result = validateServiceRadius(-5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Service radius must be at least 1 km');
    });
  });
});
