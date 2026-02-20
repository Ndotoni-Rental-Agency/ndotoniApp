/**
 * Phone number validation utilities for React Native
 * Simplified version without external dependencies
 */

/**
 * Validate international phone number format
 * Accepts formats like: +255712345678, +1234567890, etc.
 */
export function validateInternationalPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  const internationalPattern = /^\+\d{10,15}$/;
  
  // Also accept local Tanzanian format (0XXX XXX XXX)
  const localPattern = /^0\d{9}$/;
  
  return internationalPattern.test(cleaned) || localPattern.test(cleaned);
}

/**
 * Normalize phone number to E.164 format (+XXXXXXXXXXX)
 * Converts local Tanzanian numbers to international format
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If it already starts with +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Convert local Tanzanian format (0XXX) to international (+255XXX)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+255' + cleaned.substring(1);
  }
  
  // If it doesn't start with + or 0, assume it needs +255 prefix
  if (/^\d{9}$/.test(cleaned)) {
    return '+255' + cleaned;
  }
  
  // Return as is if we can't normalize
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

/**
 * Format phone number for display
 * Formats as: +255 712 345 678
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const normalized = normalizePhoneNumber(phone);
  
  // Format as +XXX XXX XXX XXX
  if (normalized.startsWith('+255')) {
    const digits = normalized.substring(4);
    return `+255 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  }
  
  // Generic formatting for other countries
  if (normalized.startsWith('+')) {
    const match = normalized.match(/^\+(\d{1,3})(\d{3})(\d{3})(\d+)$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }
  
  return normalized;
}

/**
 * Get example phone numbers for different regions
 */
export function getPhoneExamples(): { [key: string]: string } {
  return {
    'Tanzania (Local)': '0712 345 678',
    'Tanzania (International)': '+255 712 345 678',
    'Kenya': '+254 712 345 678',
    'Uganda': '+256 712 345 678',
    'USA': '+1 234 567 8900',
    'UK': '+44 123 456 789',
    'South Africa': '+27 123 456 789',
    'Nigeria': '+234 123 456 789',
    'Ghana': '+233 123 456 789',
  };
}
