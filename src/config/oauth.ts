// OAuth Configuration
// To enable Google and Apple authentication, you need to:

// 1. GOOGLE OAUTH SETUP:
//    - Go to https://console.developers.google.com/
//    - Create a new project or select existing one
//    - Enable Google+ API
//    - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
//    - Set authorized JavaScript origins to your domain
//    - Copy the Client ID and set it as environment variable: VITE_GOOGLE_CLIENT_ID

// 2. APPLE SIGN-IN SETUP:
//    - Go to https://developer.apple.com/
//    - Sign in with Apple Developer account
//    - Go to Certificates, Identifiers & Profiles
//    - Create a new App ID with Sign In with Apple capability
//    - Create a Service ID for web authentication
//    - Copy the Service ID and set it as environment variable: VITE_APPLE_CLIENT_ID

export const OAUTH_CONFIG = {
  // These will be set from environment variables
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID || '',
  
  // OAuth URLs and settings
  googleAuthUrl: 'https://accounts.google.com/gsi/client',
  appleAuthUrl: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
  
  // Redirect URIs (update these for production)
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  appleRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/apple/callback` : '',
}

// Helper functions
export const isGoogleConfigured = (): boolean => {
  return !!OAUTH_CONFIG.googleClientId && OAUTH_CONFIG.googleClientId !== ''
}

export const isAppleConfigured = (): boolean => {
  return !!OAUTH_CONFIG.appleClientId && OAUTH_CONFIG.appleClientId !== ''
}

// Instructions for developers
export const OAUTH_SETUP_INSTRUCTIONS = `
🔐 OAUTH SETUP INSTRUCTIONS

1. GOOGLE OAUTH:
   - Visit: https://console.developers.google.com/
   - Create/select project
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Set authorized origins: ${OAUTH_CONFIG.redirectUri}
   - Add environment variable: VITE_GOOGLE_CLIENT_ID=your_client_id

2. APPLE SIGN-IN:
   - Visit: https://developer.apple.com/
   - Create App ID with Sign In with Apple
   - Create Service ID for web auth
   - Set redirect URI: ${OAUTH_CONFIG.appleRedirectUri}
   - Add environment variable: VITE_APPLE_CLIENT_ID=your_service_id

3. ENVIRONMENT VARIABLES:
   Create a .supaenv file in your project root:
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_APPLE_CLIENT_ID=your_apple_service_id

4. TESTING:
   - OAuth buttons will only appear when properly configured
   - Check browser console for OAuth initialization status
   - Test on HTTPS in production (required for OAuth)
`
