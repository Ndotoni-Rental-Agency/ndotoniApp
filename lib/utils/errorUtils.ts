/**
 * Error utility functions - Safe error handling for user-facing messages.
 * 
 * SECURITY: Never show raw error.message to users. It may contain internal
 * details (DB errors, API keys, service names) that attackers can exploit.
 * 
 * All user-facing error display should go through getSafeErrorMessage().
 */

// ─── Known Cognito/Auth Error Mappings ─────────────────────────────────────────

const AUTH_ERROR_MAP: Record<string, string> = {
  UserNotConfirmedException: 'Your account needs to be verified. Please check your email for the verification code.',
  UsernameExistsException: 'An account with this email already exists.',
  NotAuthorizedException: 'Incorrect email or password.',
  UserNotFoundException: 'No account found with this email.',
  InvalidPasswordException: 'Password does not meet requirements.',
  CodeMismatchException: 'Invalid verification code.',
  ExpiredCodeException: 'Verification code has expired. Please request a new one.',
  UserUnAuthenticatedError: 'Authentication session expired. Please sign in again.',
  UserUnAuthenticatedException: 'Authentication session expired. Please sign in again.',
  LimitExceededException: 'Too many attempts. Please wait a few minutes before trying again.',
  TooManyRequestsException: 'Too many requests. Please wait a moment and try again.',
};

// ─── Safe message patterns from the backend (NdotoniError messages) ────────────
// These are messages intentionally crafted by our backend to be user-safe.
// We allow them through without replacing with a generic fallback.

const SAFE_MESSAGE_PATTERNS = [
  'Please sign in to continue',
  'The requested',
  'could not be found',
  'You do not have permission',
  'Too many requests',
  'Something went wrong',
  'Email and password are required',
  'Email and verification code are required',
  'Email is required',
  'This booking has already been paid',
  'These dates are no longer available',
];

/**
 * Checks if a message looks like it came from our backend's NdotoniError
 * (i.e., it's already been sanitized server-side and is safe to display).
 */
function isBackendSafeMessage(message: string): boolean {
  return SAFE_MESSAGE_PATTERNS.some(pattern => message.includes(pattern));
}

// ─── Unsafe patterns that should NEVER be shown to users ───────────────────────

const UNSAFE_PATTERNS = [
  /api[_-]?key/i,
  /dynamodb/i,
  /cognito/i,
  /lambda/i,
  /internal server/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /socket hang up/i,
  /network request failed/i,
  /unexpected token/i,
  /cannot read propert/i,
  /undefined is not/i,
  /null is not/i,
  /stack overflow/i,
  /out of memory/i,
  /ENOMEM/i,
  /permission denied/i,
  /access denied/i,
  /secret/i,
  /password.*hash/i,
  /connection.*refused/i,
  /table.*not.*found/i,
  /column.*not.*found/i,
  /syntax error/i,
  /unhandled/i,
  /aws/i,
  /s3/i,
  /sqs/i,
  /sns/i,
  /arn:/i,
];

function containsUnsafeContent(message: string): boolean {
  return UNSAFE_PATTERNS.some(pattern => pattern.test(message));
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a safe error message suitable for displaying to the user.
 * 
 * @param error - The caught error (can be any type)
 * @param context - What the user was trying to do (e.g., 'signing in', 'loading properties')
 * @returns A user-friendly error message that never leaks internal details
 */
export function getSafeErrorMessage(error: unknown, context?: string): string {
  // Check for known Cognito/auth error names first
  const errorName = (error as any)?.name;
  if (errorName && AUTH_ERROR_MAP[errorName]) {
    return AUTH_ERROR_MAP[errorName];
  }

  // Extract the raw message
  const rawMessage = extractRawMessage(error);

  // Check if it's a rate limit error
  if (isRateLimitError(error)) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  // If it matches our backend's safe message patterns, allow it through
  if (rawMessage && isBackendSafeMessage(rawMessage)) {
    return rawMessage;
  }

  // If the message contains unsafe internal details, replace with generic
  if (rawMessage && containsUnsafeContent(rawMessage)) {
    return context
      ? `Something went wrong while ${context}. Please try again.`
      : 'Something went wrong. Please try again.';
  }

  // For short, simple messages that don't look technical, allow them
  // (e.g., "Booking not found", "Invalid date range")
  if (rawMessage && rawMessage.length < 100 && !containsUnsafeContent(rawMessage)) {
    return rawMessage;
  }

  // Default: generic safe message
  return context
    ? `Something went wrong while ${context}. Please try again.`
    : 'Something went wrong. Please try again.';
}

/**
 * Extract the raw message from any error format (internal use only).
 * Do NOT display the result of this function directly to users.
 */
function extractRawMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    // GraphQL error array
    if ((error as any).errors && Array.isArray((error as any).errors) && (error as any).errors.length > 0) {
      return (error as any).errors[0].message || null;
    }

    if ((error as any).message) {
      return (error as any).message;
    }
  }

  return null;
}

// ─── Legacy helpers (kept for backward compatibility with existing code) ───────

/**
 * @deprecated Use getSafeErrorMessage() instead
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  return getSafeErrorMessage(error) || fallbackMessage;
}

/**
 * @deprecated Use getSafeErrorMessage() instead
 */
export function getFriendlyErrorMessage(error: unknown): string {
  return getSafeErrorMessage(error);
}

/**
 * Checks if an error indicates the user needs email verification
 */
export function isUserNotConfirmedError(error: unknown): boolean {
  const name = (error as any)?.name;
  const message = extractRawMessage(error)?.toLowerCase() || '';

  return name === 'UserNotConfirmedException' ||
         message.includes('user is not confirmed') ||
         message.includes('not confirmed') ||
         message.includes('usernotconfirmedexception');
}

/**
 * Checks if an error indicates the user already exists
 */
export function isUserAlreadyExistsError(error: unknown): boolean {
  const name = (error as any)?.name;
  const message = extractRawMessage(error)?.toLowerCase() || '';

  return name === 'UsernameExistsException' ||
         message.includes('user already exists') ||
         message.includes('usernameexistsexception') ||
         message.includes('an account with the given email already exists');
}

/**
 * Checks if an error indicates rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  const name = (error as any)?.name;
  const message = extractRawMessage(error)?.toLowerCase() || '';

  return name === 'LimitExceededException' ||
         name === 'TooManyRequestsException' ||
         message.includes('attempt limit exceeded') ||
         message.includes('too many requests') ||
         message.includes('rate limit') ||
         message.includes('try after some time');
}

/**
 * Checks if an error is a network/connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
  const message = extractRawMessage(error)?.toLowerCase() || '';
  return message.includes('network request failed') ||
         message.includes('econnrefused') ||
         message.includes('etimedout') ||
         message.includes('socket hang up') ||
         message.includes('fetch failed');
}

/**
 * Get a user-friendly message specifically for network errors
 */
export function getNetworkErrorMessage(): string {
  return 'Unable to connect. Please check your internet connection and try again.';
}
