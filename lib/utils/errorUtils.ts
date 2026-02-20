/**
 * Error handling utilities for React Native
 * Extracts error messages from different error formats (GraphQL, Cognito, etc.)
 */

/**
 * Extracts error message from different error formats
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle Cognito/Amplify error structure
    if ((error as any).name) {
      const name = (error as any).name;
      const message = (error as any).message;
      
      // Map common Cognito error names to friendly messages
      if (name === 'UserNotConfirmedException') {
        return 'User is not confirmed. Please verify your email.';
      }
      if (name === 'UsernameExistsException') {
        return 'An account with this email already exists.';
      }
      if (name === 'NotAuthorizedException') {
        return 'Incorrect email or password.';
      }
      if (name === 'UserNotFoundException') {
        return 'No account found with this email.';
      }
      if (name === 'InvalidPasswordException') {
        return 'Password does not meet requirements.';
      }
      if (name === 'CodeMismatchException') {
        return 'Invalid verification code.';
      }
      if (name === 'ExpiredCodeException') {
        return 'Verification code has expired. Please request a new one.';
      }
      if (name === 'UserUnAuthenticatedError' || name === 'UserUnAuthenticatedException') {
        return 'Authentication session expired. Please try again.';
      }
      if (name === 'LimitExceededException') {
        return 'Too many attempts. Please wait a few minutes before trying again.';
      }
      
      // Return the message if available
      if (message) {
        return message;
      }
    }
    
    // Handle GraphQL error structure
    if ((error as any).errors && Array.isArray((error as any).errors) && (error as any).errors.length > 0) {
      return (error as any).errors[0].message || fallbackMessage;
    }
    
    // Handle object with message property
    if ((error as any).message) {
      return (error as any).message;
    }
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
}

/**
 * Checks if an error indicates the user needs email verification
 */
export function isUserNotConfirmedError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase();
  return message.includes('user is not confirmed') || 
         message.includes('not confirmed') ||
         message.includes('usernotconfirmedexception');
}

/**
 * Checks if an error indicates the user already exists
 */
export function isUserAlreadyExistsError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase();
  return message.includes('user already exists') || 
         message.includes('usernameexistsexception') ||
         message.includes('an account with the given email already exists');
}

/**
 * Checks if an error indicates rate limiting from Cognito
 */
export function isRateLimitError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase();
  return message.includes('attempt limit exceeded') || 
         message.includes('too many requests') ||
         message.includes('rate limit') ||
         message.includes('limitexceeded') ||
         message.includes('try after some time');
}

/**
 * Gets user-friendly error message for common authentication errors
 */
export function getFriendlyErrorMessage(error: unknown): string {
  const message = extractErrorMessage(error);
  
  if (isRateLimitError(error)) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  
  if (isUserNotConfirmedError(error)) {
    return 'Your account needs to be verified. Please check your email for the verification code.';
  }
  
  if (isUserAlreadyExistsError(error)) {
    return 'An account with this email already exists. Please sign in or use a different email.';
  }
  
  // Return the extracted message (which may already be friendly from extractErrorMessage)
  return message;
}
