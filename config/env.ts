import Constants from 'expo-constants';

/**
 * Environment configuration
 * 
 * In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be accessible in the app.
 * They are loaded from .env file and can be accessed via Constants.expoConfig.extra
 * 
 * For iOS Preview (Expo Go):
 * - Environment variables work automatically
 * - Just restart the dev server after changing .env
 * 
 * For Production builds:
 * - Use EAS Secrets: eas secret:create --name EXPO_PUBLIC_VAR_NAME --value "value"
 * - Or set in eas.json under build profiles
 */

interface EnvConfig {
  // AWS Configuration
  AWS_REGION: string;
  AWS_USER_POOL_ID: string;
  AWS_USER_POOL_WEB_CLIENT_ID: string;
  AWS_APPSYNC_ENDPOINT: string;
  AWS_APPSYNC_API_KEY: string;
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: string;
  
  // CloudFront & S3
  CLOUDFRONT_DOMAIN: string;
  S3_BUCKET: string;
  
  // Environment
  ENV: 'development' | 'staging' | 'production';
}

function getEnvVar(key: string, fallback?: string): string {
  // Try to get from process.env first (for web/metro bundler)
  const processEnvKey = `EXPO_PUBLIC_${key}`;
  if (typeof process !== 'undefined' && process.env && process.env[processEnvKey]) {
    return process.env[processEnvKey] as string;
  }
  
  // Try to get from Constants.expoConfig.extra
  const value = Constants.expoConfig?.extra?.[processEnvKey];
  
  if (value) {
    return value;
  }
  
  if (fallback !== undefined) {
    return fallback;
  }
  
  console.warn(`Environment variable ${key} is not set`);
  return '';
}

export const env: EnvConfig = {
  // AWS Configuration
  AWS_REGION: getEnvVar('AWS_REGION', 'us-west-2'),
  AWS_USER_POOL_ID: getEnvVar('AWS_USER_POOL_ID'),
  AWS_USER_POOL_WEB_CLIENT_ID: getEnvVar('AWS_USER_POOL_WEB_CLIENT_ID'),
  AWS_APPSYNC_ENDPOINT: getEnvVar('AWS_APPSYNC_ENDPOINT'),
  AWS_APPSYNC_API_KEY: getEnvVar('AWS_APPSYNC_API_KEY'),
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', 'AIzaSyAmuUwdIwg_Jz6TGqOpzpWDvKl5YdvNP6w'),
  
  // CloudFront & S3
  CLOUDFRONT_DOMAIN: getEnvVar('CLOUDFRONT_DOMAIN', 'https://d2bstvyam1bm1f.cloudfront.net'),
  S3_BUCKET: getEnvVar('S3_BUCKET', 'ndotoni-media-storage-dev'),
  
  // Environment
  ENV: (getEnvVar('ENV', 'development') as EnvConfig['ENV']),
};

// Validate required environment variables
const requiredVars: (keyof EnvConfig)[] = [
  'AWS_REGION',
  'AWS_USER_POOL_ID',
  'AWS_USER_POOL_WEB_CLIENT_ID',
  'AWS_APPSYNC_ENDPOINT',
  'AWS_APPSYNC_API_KEY',
];

const missingVars = requiredVars.filter(key => !env[key]);

if (missingVars.length > 0 && env.ENV !== 'development') {
  console.error('Missing required environment variables:', missingVars);
}

export default env;
