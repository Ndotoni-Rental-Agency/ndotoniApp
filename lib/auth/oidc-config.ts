/**
 * OIDC Configuration for Cognito Authentication
 * Using oidc-client-ts for OAuth/OIDC flows in React Native
 */

import Constants from 'expo-constants';

// Get configuration from environment variables
const getUserPoolId = () => {
  return process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-west-2_0DZJBusjf';
};

const getMobileClientId = () => {
  return process.env.EXPO_PUBLIC_MOBILE_CLIENT_ID || '3f51e2m3fpoqrf6jrh19u7p8s';
};

const getCognitoDomain = () => {
  return process.env.EXPO_PUBLIC_COGNITO_DOMAIN || 'rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com';
};

const getRegion = () => {
  return process.env.EXPO_PUBLIC_REGION || 'us-west-2';
};

// Determine redirect URI based on environment
const getRedirectUri = () => {
  // In development with Expo Go
  if (__DEV__) {
    return 'exp://127.0.0.1:8081';
  }
  
  // In production or EAS Build
  return 'ndotoniapp://auth/callback';
};

const getLogoutUri = () => {
  if (__DEV__) {
    return 'exp://127.0.0.1:8081';
  }
  
  return 'ndotoniapp://';
};

// OIDC Configuration
export const oidcConfig = {
  // Cognito OIDC authority (issuer)
  authority: `https://cognito-idp.${getRegion()}.amazonaws.com/${getUserPoolId()}`,
  
  // Mobile client ID
  client_id: getMobileClientId(),
  
  // Redirect URI after successful authentication
  redirect_uri: getRedirectUri(),
  
  // OAuth response type (authorization code flow)
  response_type: 'code',
  
  // Requested scopes
  scope: 'email openid profile',
  
  // Cognito domain for hosted UI
  cognitoDomain: `https://${getCognitoDomain()}`,
  
  // Logout URI
  logout_uri: getLogoutUri(),
  
  // Token endpoint (required for code exchange)
  token_endpoint: `https://${getCognitoDomain()}/oauth2/token`,
  
  // Authorization endpoint (required)
  authorization_endpoint: `https://${getCognitoDomain()}/oauth2/authorize`,
  
  // UserInfo endpoint
  userinfo_endpoint: `https://${getCognitoDomain()}/oauth2/userInfo`,
  
  // Additional OIDC settings
  automaticSilentRenew: false, // Disable for now to avoid issues
  loadUserInfo: true, // Load user profile from /userinfo endpoint
  
  // Metadata for OIDC discovery
  metadata: {
    issuer: `https://cognito-idp.${getRegion()}.amazonaws.com/${getUserPoolId()}`,
    authorization_endpoint: `https://${getCognitoDomain()}/oauth2/authorize`,
    token_endpoint: `https://${getCognitoDomain()}/oauth2/token`,
    userinfo_endpoint: `https://${getCognitoDomain()}/oauth2/userInfo`,
    jwks_uri: `https://cognito-idp.${getRegion()}.amazonaws.com/${getUserPoolId()}/.well-known/jwks.json`,
    end_session_endpoint: `https://${getCognitoDomain()}/logout`,
  }
};

// Helper to get full logout URL
export const getLogoutUrl = () => {
  const { client_id, logout_uri, cognitoDomain } = oidcConfig;
  return `${cognitoDomain}/logout?client_id=${client_id}&logout_uri=${encodeURIComponent(logout_uri)}`;
};

// Helper to get full authorize URL (for manual OAuth if needed)
export const getAuthorizeUrl = () => {
  const { cognitoDomain, client_id, redirect_uri, response_type, scope } = oidcConfig;
  return `${cognitoDomain}/oauth2/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=${response_type}&scope=${encodeURIComponent(scope)}`;
};

export default oidcConfig;
