/**
 * VerifyMy Age Verification Configuration
 * Documentation: https://verifymyage.com/developers
 *
 * OAuth-style flow with HMAC-SHA256 authentication
 */

export const VERIFYMYAGE_CONFIG = {
  // Environment URLs
  sandbox: {
    baseUrl: 'https://sandbox.verifymyage.com',
    authEndpoint: '/v2/auth/start',
    tokenEndpoint: '/oauth/token',
    userEndpoint: '/users/me',
  },
  production: {
    baseUrl: 'https://oauth.verifymyage.com',
    authEndpoint: '/v2/auth/start',
    tokenEndpoint: '/oauth/token',
    userEndpoint: '/users/me',
  },

  // Use sandbox in development, production otherwise
  get current() {
    const isProd = typeof window !== 'undefined'
      ? window.location.hostname !== 'localhost'
      : process.env.NODE_ENV === 'production';
    return isProd ? this.production : this.sandbox;
  },

  // Redirect URI for OAuth callback
  get redirectUri() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/verifymyage/callback`;
    }
    return process.env.VERIFYMYAGE_REDIRECT_URI || 'http://localhost:3022/auth/verifymyage/callback';
  },

  // Scopes requested during verification
  scopes: ['age_verification', 'basic_profile'],

  // Minimum age required (in years)
  minimumAge: 18,

  // Session storage key for verification state
  storageKey: 'vma_verification_state',

  // Cookie name for verified status
  verifiedCookieName: 'age_verified',

  // Verification expiry (30 days in seconds)
  verificationExpiry: 30 * 24 * 60 * 60,
};

// Verification status types
export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'failed'
  | 'expired';

// Response from VerifyMy API
export interface VerifyMyUserResponse {
  age_verified: boolean;
  verification_date?: string;
  country?: string;
  region?: string;
  error?: string;
}

// Local verification state
export interface VerificationState {
  status: VerificationStatus;
  verifiedAt?: string;
  expiresAt?: string;
  sessionId?: string;
}

/**
 * Check if verification is still valid
 */
export function isVerificationValid(state: VerificationState | null): boolean {
  if (!state) return false;
  if (state.status !== 'verified') return false;
  if (!state.expiresAt) return false;

  return new Date(state.expiresAt) > new Date();
}

/**
 * Create a new verification state
 */
export function createVerificationState(verified: boolean): VerificationState {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + VERIFYMYAGE_CONFIG.verificationExpiry * 1000);

  return {
    status: verified ? 'verified' : 'failed',
    verifiedAt: verified ? now.toISOString() : undefined,
    expiresAt: verified ? expiresAt.toISOString() : undefined,
  };
}

/**
 * Store verification state in localStorage
 */
export function storeVerificationState(state: VerificationState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(VERIFYMYAGE_CONFIG.storageKey, JSON.stringify(state));
  }
}

/**
 * Retrieve verification state from localStorage
 */
export function getStoredVerificationState(): VerificationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(VERIFYMYAGE_CONFIG.storageKey);
    if (!stored) return null;
    return JSON.parse(stored) as VerificationState;
  } catch {
    return null;
  }
}

/**
 * Clear verification state
 */
export function clearVerificationState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VERIFYMYAGE_CONFIG.storageKey);
  }
}

export default VERIFYMYAGE_CONFIG;
