/**
 * Polyfills for React Native
 * Required for AWS Amplify Cognito authentication
 */

// Crypto polyfill for React Native
import 'react-native-get-random-values';

// URL polyfill
import 'react-native-url-polyfill/auto';

// TextEncoder/TextDecoder polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

// Ensure crypto.getRandomValues is available
if (typeof global.crypto === 'undefined') {
  global.crypto = {} as any;
}

if (typeof global.crypto.getRandomValues === 'undefined') {
  const getRandomValues = require('react-native-get-random-values').getRandomValues;
  global.crypto.getRandomValues = getRandomValues;
}

// Base64 polyfills (atob/btoa) for JWT decoding
if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => {
    return Buffer.from(str, 'base64').toString('binary');
  };
}

if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

console.log('[Polyfills] Loaded successfully');
