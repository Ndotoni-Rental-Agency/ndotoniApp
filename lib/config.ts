// AWS Amplify Configuration for Mobile App
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-west-2_N7XRQtTla',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || 'djgqjttrjucdoah5ap41ojcjh',
      loginWith: {
        oauth: {
          domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN || 'auth-beta.ndotoni.com',
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
      endpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'https://otp4pddzjjhvzdwcexgxcuopp4.appsync-api.us-west-2.amazonaws.com/graphql',
      region: process.env.EXPO_PUBLIC_GRAPHQL_REGION || 'us-west-2',
      defaultAuthMode: 'apiKey' as const,
      apiKey: process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve'
    }
  }
};

// CloudFront cache URLs
export const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';

export const CACHE_URLS = {
  shortTermHomepage: process.env.EXPO_PUBLIC_SHORT_TERM_CACHE_URL || 'https://d2rvqxqxqxqxqx.cloudfront.net/short-term-homepage.json',
  longTermHomepage: process.env.EXPO_PUBLIC_LONG_TERM_CACHE_URL || 'https://d2rvqxqxqxqxqx.cloudfront.net/long-term-homepage.json',
};

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAmuUwdIwg_Jz6TGqOpzpWDvKl5YdvNP6w';
