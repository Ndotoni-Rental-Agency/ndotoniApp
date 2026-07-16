// AWS Amplify Configuration for Mobile App
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN!,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [process.env.EXPO_PUBLIC_REDIRECT_SIGN_IN || 'ndotoniapp://'],
          redirectSignOut: [process.env.EXPO_PUBLIC_REDIRECT_SIGN_OUT || 'ndotoniapp://'],
          responseType: 'code'
        }
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT!,
      region: process.env.EXPO_PUBLIC_GRAPHQL_REGION || 'us-west-2',
      defaultAuthMode: 'apiKey' as const,
      apiKey: process.env.EXPO_PUBLIC_API_KEY!
    }
  }
};

// CloudFront cache URLs
export const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN!;

export const CACHE_URLS = {
  shortTermHomepage: process.env.EXPO_PUBLIC_SHORT_TERM_CACHE_URL || `${CLOUDFRONT_DOMAIN}/short-term-homepage.json`,
  longTermHomepage: process.env.EXPO_PUBLIC_LONG_TERM_CACHE_URL || `${CLOUDFRONT_DOMAIN}/long-term-homepage.json`,
};

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;
