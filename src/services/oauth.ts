// OAuth Service for Google and Apple Authentication
// This service handles OAuth authentication without external dependencies

import { OAUTH_CONFIG, isGoogleConfigured, isAppleConfigured } from '../config/oauth'

export interface OAuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  provider: 'google' | 'apple'
}

export interface GoogleOAuthResponse {
  credential: string
  select_by: string
}

export interface AppleOAuthResponse {
  authorization: {
    id_token: string
    code: string
  }
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
    email?: string
  }
}

class OAuthService {
  private googleClientId = OAUTH_CONFIG.googleClientId
  private appleClientId = OAUTH_CONFIG.appleClientId

  // Initialize Google OAuth
  async initializeGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google OAuth not available in server environment'))
        return
      }

      // Load Google Identity Services script
      const script = document.createElement('script')
      script.src = OAUTH_CONFIG.googleAuthUrl
      script.async = true
      script.defer = true
      
      script.onload = () => {
        try {
          // @ts-ignore - Google Identity Services global
          if (window.google) {
            // @ts-ignore
            window.google.accounts.id.initialize({
              client_id: this.googleClientId,
              callback: this.handleGoogleCallback.bind(this)
            })
            resolve()
          } else {
            reject(new Error('Google Identity Services failed to load'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'))
      }
      
      document.head.appendChild(script)
    })
  }

  // Handle Google OAuth callback
  private handleGoogleCallback(response: GoogleOAuthResponse): OAuthUser | null {
    try {
      // Decode JWT token (simplified - in production, verify signature)
      const payload = this.decodeJWT(response.credential)
      
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: 'google'
      }
    } catch (error) {
      console.error('Error handling Google OAuth callback:', error)
      return null
    }
  }

  // Trigger Google Sign-In
  async signInWithGoogle(): Promise<OAuthUser | null> {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        if (!window.google) {
          reject(new Error('Google Identity Services not initialized'))
          return
        }

        // @ts-ignore
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Try alternative method
            // @ts-ignore
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                width: '100%'
              }
            )
          }
        })

        // Store resolve function for callback
        // @ts-ignore
        window.googleCallback = (user: OAuthUser | null) => {
          resolve(user)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  // Initialize Apple Sign-In
  async initializeApple(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Apple Sign-In not available in server environment'))
        return
      }

      // Load Apple Sign-In script
      const script = document.createElement('script')
      script.src = OAUTH_CONFIG.appleAuthUrl
      script.async = true
      
      script.onload = () => {
        try {
          // @ts-ignore - Apple Sign-In global
          if (window.AppleID) {
            // @ts-ignore
            window.AppleID.auth.init({
              clientId: this.appleClientId,
              scope: 'name email',
              redirectURI: OAUTH_CONFIG.appleRedirectUri,
              state: 'apple-signin',
              usePopup: true
            })
            resolve()
          } else {
            reject(new Error('Apple Sign-In failed to load'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Apple Sign-In'))
      }
      
      document.head.appendChild(script)
    })
  }

  // Trigger Apple Sign-In
  async signInWithApple(): Promise<OAuthUser | null> {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        if (!window.AppleID) {
          reject(new Error('Apple Sign-In not initialized'))
          return
        }

        // @ts-ignore
        window.AppleID.auth.signIn().then((response: AppleOAuthResponse) => {
          try {
            const user: OAuthUser = {
              id: response.authorization.id_token,
              name: response.user?.name ? 
                `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim() :
                'Apple User',
              email: response.user?.email || '',
              avatar: undefined,
              provider: 'apple'
            }
            resolve(user)
          } catch (error) {
            reject(error)
          }
        }).catch((error: any) => {
          reject(error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  // Decode JWT token (simplified version)
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error('Invalid JWT token')
    }
  }

  // Check if OAuth is available
  isGoogleAvailable(): boolean {
    return typeof window !== 'undefined' && isGoogleConfigured()
  }

  isAppleAvailable(): boolean {
    return typeof window !== 'undefined' && isAppleConfigured()
  }

  // Set OAuth client IDs (to be called from environment variables)
  setGoogleClientId(clientId: string): void {
    this.googleClientId = clientId
  }

  setAppleClientId(clientId: string): void {
    this.appleClientId = clientId
  }
}

// Export singleton instance
export const oauthService = new OAuthService()

// Global callback for Google OAuth
declare global {
  interface Window {
    google?: any
    AppleID?: any
    googleCallback?: (user: OAuthUser | null) => void
  }
}

// Update Google callback to use global callback
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.handleGoogleCallback = (response: GoogleOAuthResponse) => {
    const user = oauthService['handleGoogleCallback'](response)
    // @ts-ignore
    if (window.googleCallback) {
      // @ts-ignore
      window.googleCallback(user)
    }
  }
}
