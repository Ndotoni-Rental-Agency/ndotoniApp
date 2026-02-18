// AWS Amplify Configuration for Mobile App
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-west-2_0DZJBusjf',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || '4k6u174tgu4glhi814ulihckh4',
      loginWith: {
        oauth: {
          domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN || 'rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [process.env.EXPO_PUBLIC_REDIRECT_SIGN_IN || 'ndotoni://'],
          redirectSignOut: [process.env.EXPO_PUBLIC_REDIRECT_SIGN_OUT || 'ndotoni://'],
          responseType: 'code'
        }
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql',
      region: process.env.EXPO_PUBLIC_GRAPHQL_REGION || 'us-west-2',
      defaultAuthMode: 'apiKey' as const,
      apiKey: process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve'
    }
  }
};

// CloudFront cache URLs
export const CACHE_URLS = {
  shortTermHomepage: process.env.EXPO_PUBLIC_SHORT_TERM_CACHE_URL || 'https://d2rvqxqxqxqxqx.cloudfront.net/short-term-homepage.json',
  longTermHomepage: process.env.EXPO_PUBLIC_LONG_TERM_CACHE_URL || 'https://d2rvqxqxqxqxqx.cloudfront.net/long-term-homepage.json',
};
