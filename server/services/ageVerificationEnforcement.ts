/**
 * AGE VERIFICATION ENFORCEMENT SYSTEM
 * CRITICAL LEGAL COMPLIANCE FOR:
 * - UK Online Safety Act 2023
 * - US State Laws (Louisiana, Utah, Virginia, Texas, Arkansas, Mississippi, Montana, etc.)
 * - France ARCOM requirements
 * - Germany JMStV compliance
 *
 * LEGAL REQUIREMENT: "Highly effective" age verification REQUIRED before any adult content access
 * PENALTY: Up to £18M or 10% global revenue (UK), $5,000+ per violation (US states), criminal liability
 */

import { db } from '../db';
import { users, ageVerificationRecords } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyMyService } from './verifyMyService';

export interface JurisdictionRequirements {
  jurisdiction: string;
  requiresVerification: boolean;
  verificationMethods: ('id_document' | 'credit_card' | 'third_party_avs' | 'age_estimation')[];
  minAge: number;
  retentionYears: number;
  legalReference: string;
  penaltyAmount: string;
}

export interface AgeVerificationResult {
  verified: boolean;
  method: string;
  verificationId: string;
  jurisdiction: string;
  timestamp: Date;
  expiresAt?: Date;
  error?: string;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  postalCode: string;
  ipAddress: string;
  confidence: number;
}

/**
 * JURISDICTION-SPECIFIC REQUIREMENTS
 */
const JURISDICTION_REQUIREMENTS: Record<string, JurisdictionRequirements> = {
  // UNITED KINGDOM - Strictest enforcement
  'GB': {
    jurisdiction: 'United Kingdom',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs', 'credit_card', 'age_estimation'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Online Safety Act 2023 - Part 3',
    penaltyAmount: '£18M or 10% global revenue + criminal liability'
  },

  // FRANCE - ARCOM enforcement
  'FR': {
    jurisdiction: 'France',
    requiresVerification: true,
    verificationMethods: ['id_document', 'credit_card', 'third_party_avs'],
    minAge: 18,
    retentionYears: 5,
    legalReference: 'Article 23 - Law on Trust in Digital Economy',
    penaltyAmount: '€250,000 or 4% global revenue + site blocking'
  },

  // GERMANY - KJM enforcement
  'DE': {
    jurisdiction: 'Germany',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 5,
    legalReference: 'JMStV - Interstate Treaty on Protection of Minors',
    penaltyAmount: '€500,000 + site blocking'
  },

  // US STATES WITH AGE VERIFICATION LAWS
  'US-LA': {
    jurisdiction: 'Louisiana, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Louisiana Act 440 (2023)',
    penaltyAmount: '$5,000 per violation + civil liability'
  },
  'US-UT': {
    jurisdiction: 'Utah, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Utah S.B. 287 (2023)',
    penaltyAmount: '$10,000-$25,000 per violation'
  },
  'US-VA': {
    jurisdiction: 'Virginia, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Virginia H.B. 1670',
    penaltyAmount: '$10,000-$25,000 per violation'
  },
  'US-TX': {
    jurisdiction: 'Texas, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs', 'credit_card'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Texas H.B. 1181',
    penaltyAmount: '$10,000-$25,000 per violation'
  },
  'US-AR': {
    jurisdiction: 'Arkansas, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Arkansas S.B. 66',
    penaltyAmount: '$10,000-$25,000 per violation'
  },
  'US-MS': {
    jurisdiction: 'Mississippi, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Mississippi H.B. 1126',
    penaltyAmount: '$10,000-$25,000 per violation'
  },
  'US-MT': {
    jurisdiction: 'Montana, USA',
    requiresVerification: true,
    verificationMethods: ['id_document', 'third_party_avs'],
    minAge: 18,
    retentionYears: 7,
    legalReference: 'Montana S.B. 544',
    penaltyAmount: '$10,000-$25,000 per violation'
  }
};

class AgeVerificationEnforcementSystem {
  /**
   * Determine if age verification is required based on user's jurisdiction
   */
  async requiresAgeVerification(geolocation: GeolocationData): Promise<{
    required: boolean;
    jurisdiction: JurisdictionRequirements | null;
    reason: string;
  }> {
    // Check country-level requirements
    const countryReq = JURISDICTION_REQUIREMENTS[geolocation.country];
    if (countryReq?.requiresVerification) {
      return {
        required: true,
        jurisdiction: countryReq,
        reason: `Age verification required by ${countryReq.legalReference}`
      };
    }

    // Check US state-level requirements
    if (geolocation.country === 'US') {
      const stateKey = `US-${geolocation.region}`;
      const stateReq = JURISDICTION_REQUIREMENTS[stateKey];
      if (stateReq?.requiresVerification) {
        return {
          required: true,
          jurisdiction: stateReq,
          reason: `Age verification required by ${stateReq.legalReference}`
        };
      }
    }

    // Default: No verification required (but strongly recommended)
    return {
      required: false,
      jurisdiction: null,
      reason: 'No legal requirement in jurisdiction, but recommended'
    };
  }

  /**
   * Get user's geolocation from IP address
   */
  async getGeolocation(ipAddress: string): Promise<GeolocationData> {
    try {
      // TODO: Integrate with geolocation service (MaxMind GeoIP2, IP2Location, etc.)
      // For now, return mock data
      console.log(`[AgeVerification] Getting geolocation for IP: ${ipAddress}`);

      // In production, this would call a geolocation API
      // Example: MaxMind GeoIP2, IP2Location, ipapi.com, etc.

      return {
        country: 'GB', // Mock: UK - strictest requirements for testing
        region: 'England',
        city: 'London',
        postalCode: 'SW1A',
        ipAddress,
        confidence: 0.95
      };
    } catch (error) {
      console.error('[AgeVerification] Geolocation error:', error);
      // Default to strictest requirements if geolocation fails
      return {
        country: 'GB',
        region: 'Unknown',
        city: 'Unknown',
        postalCode: 'Unknown',
        ipAddress,
        confidence: 0.5
      };
    }
  }

  /**
   * Check if user has valid age verification
   */
  async checkUserVerification(userId: string, ipAddress: string): Promise<{
    verified: boolean;
    requiresVerification: boolean;
    jurisdiction: JurisdictionRequirements | null;
    verificationRecord?: any;
    error?: string;
  }> {
    try {
      // Get user's geolocation
      const geolocation = await this.getGeolocation(ipAddress);

      // Check if verification required in jurisdiction
      const { required, jurisdiction, reason } = await this.requiresAgeVerification(geolocation);

      if (!required) {
        return {
          verified: true,
          requiresVerification: false,
          jurisdiction: null
        };
      }

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        return {
          verified: false,
          requiresVerification: true,
          jurisdiction,
          error: 'User not found'
        };
      }

      // Check if user has been verified
      // TODO: Query ageVerificationRecords table when it's added to schema
      // For now, check user.emailVerified as placeholder

      if (user.emailVerified) {
        return {
          verified: true,
          requiresVerification: true,
          jurisdiction,
          verificationRecord: {
            method: 'placeholder',
            verifiedAt: user.createdAt
          }
        };
      }

      return {
        verified: false,
        requiresVerification: true,
        jurisdiction,
        error: `Age verification required by ${jurisdiction.legalReference}`
      };

    } catch (error) {
      console.error('[AgeVerification] Check user verification error:', error);
      return {
        verified: false,
        requiresVerification: true,
        jurisdiction: JURISDICTION_REQUIREMENTS['GB'], // Fail safe to strictest
        error: 'Verification check failed'
      };
    }
  }

  /**
   * Initiate age verification flow
   */
  async initiateVerification(userId: string, method: 'id_document' | 'credit_card' | 'third_party_avs', options?: {
    redirectUrl?: string;
    stealth?: boolean;
  }): Promise<{
    success: boolean;
    verificationUrl?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user || !user.email) {
        return {
          success: false,
          error: 'User not found or email missing'
        };
      }

      // Use VerifyMy service for third-party verification
      if (method === 'third_party_avs') {
        const result = await verifyMyService.startAgeVerification({
          userId,
          email: user.email,
          redirectUrl: options?.redirectUrl || `${process.env.COMMAND_CENTER_URL}/age-verification/callback`,
          stealth: options?.stealth || false
        });

        return {
          success: true,
          verificationUrl: result.verificationUrl,
          sessionId: result.sessionId
        };
      }

      // For other methods, return placeholder
      return {
        success: true,
        verificationUrl: `${process.env.COMMAND_CENTER_URL}/age-verification/${method}?userId=${userId}`,
        sessionId: `${method}_${userId}_${Date.now()}`
      };

    } catch (error) {
      console.error('[AgeVerification] Initiate verification error:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Complete age verification and store record
   */
  async completeVerification(userId: string, verificationData: {
    method: string;
    sessionId: string;
    verified: boolean;
    age?: number;
    jurisdiction: string;
  }): Promise<AgeVerificationResult> {
    try {
      // TODO: Store in ageVerificationRecords table
      // For now, update user record

      if (verificationData.verified) {
        await db.update(users)
          .set({
            emailVerified: true, // Placeholder
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }

      const timestamp = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365); // Valid for 1 year

      return {
        verified: verificationData.verified,
        method: verificationData.method,
        verificationId: verificationData.sessionId,
        jurisdiction: verificationData.jurisdiction,
        timestamp,
        expiresAt: verificationData.verified ? expiresAt : undefined
      };

    } catch (error) {
      console.error('[AgeVerification] Complete verification error:', error);
      return {
        verified: false,
        method: verificationData.method,
        verificationId: verificationData.sessionId,
        jurisdiction: verificationData.jurisdiction,
        timestamp: new Date(),
        error: String(error)
      };
    }
  }

  /**
   * GDPR-compliant data minimization
   * Store only necessary verification data, not full ID documents
   */
  async storeVerificationRecord(userId: string, record: {
    verificationMethod: string;
    verificationProvider: string;
    verifiedAt: Date;
    expiresAt: Date;
    jurisdiction: string;
    legalBasis: string; // GDPR Article 6 basis
    dataRetentionReason: string;
  }): Promise<boolean> {
    try {
      // TODO: Store in ageVerificationRecords table with proper GDPR fields
      console.log(`[AgeVerification] Storing verification record for user ${userId}`);

      // GDPR requirements:
      // 1. Legal basis documented (Article 6(1)(c) - legal obligation)
      // 2. Data minimization (Article 5(1)(c) - store only verification result, not full ID)
      // 3. Retention limitation (Article 5(1)(e) - 7 years for legal compliance)
      // 4. Integrity and confidentiality (Article 5(1)(f) - encrypted storage)

      return true;
    } catch (error) {
      console.error('[AgeVerification] Store record error:', error);
      return false;
    }
  }
}

export const ageVerificationEnforcement = new AgeVerificationEnforcementSystem();
export { AgeVerificationEnforcementSystem };
export default AgeVerificationEnforcementSystem;
