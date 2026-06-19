/**
 * Generates a readable invite code in format ABC-123-XYZ
 * Uses characters that are easy to distinguish (no O/0, I/1/l confusion)
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes I, O for readability
  const nums = '23456789'; // Excludes 0, 1 for readability
  
  const part1 = Array.from({ length: 3 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  const part2 = Array.from({ length: 3 }, () => 
    nums[Math.floor(Math.random() * nums.length)]
  ).join('');
  
  const part3 = Array.from({ length: 3 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  return `${part1}-${part2}-${part3}`;
};

/**
 * Validates invite code format (XXX-NNN-XXX)
 */
export const isValidInviteCodeFormat = (code: string): boolean => {
  const pattern = /^[A-Z]{3}-[0-9]{3}-[A-Z]{3}$/;
  return pattern.test(code.toUpperCase());
};

/**
 * Formats user input to invite code format
 */
export const formatInviteCode = (input: string): string => {
  // Remove all non-alphanumeric characters
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Add dashes at appropriate positions
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
};
