/**
 * AWS Amplify Configuration for Mobile App
 * 
 * Configures Amplify with Cognito authentication and AppSync GraphQL
 */

import { Amplify } from 'aws-amplify';
import type { ResourcesConfig } from 'aws-amplify';

// Get configuration from environment variables
const getConfig = (): ResourcesConfig => {
  const userPoolId = process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-west-2_0DZJBusjf';
  const userPoolClientId = process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || '4k6u174tgu4glhi814ulihckh4';
  const cognitoDomain = process.env.EXPO_PUBLIC_COGNITO_DOMAIN || 'rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com';
  const redirectSignIn = process.env.EXPO_PUBLIC_REDIRECT_SIGN_IN || 'ndotoni://auth/callback';
  const redirectSignOut = process.env.EXPO_PUBLIC_REDIRECT_SIGN_OUT || 'ndotoni://';
  const graphqlEndpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';
  const graphqlRegion = process.env.EXPO_PUBLIC_GRAPHQL_REGION || 'us-west-2';
  const apiKey = process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve';

  return {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: {
            domain: cognitoDomain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: 'code'
          }
        }
      }
    },
    API: {
      GraphQL: {
        endpoint: graphqlEndpoint,
        region: graphqlRegion,
        defaultAuthMode: 'apiKey' as const,
        apiKey
      }
    }
  };
};

// Configure Amplify
Amplify.configure(getConfig(), { ssr: false });

export default Amplify;
