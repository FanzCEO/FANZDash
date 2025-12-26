/**
 * VerifyMy Age & Identity Verification Service
 * Integration with verifymy.io for adult content compliance
 */

import crypto from 'crypto';

interface VerifyMyConfig {
  apiKey: string;
  secret: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

interface VerificationResult {
  success: boolean;
  verified: boolean;
  verificationId?: string;
  age?: number;
  country?: string;
  method?: string;
  error?: string;
}

interface ContentVerification {
  uploaderId: string;
  participantIds: string[];
  contentType: 'image' | 'video' | 'stream';
  verified: boolean;
  consentVerified: boolean;
}

class VerifyMyService {
  private config: VerifyMyConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.VERIFYMY_API_KEY || '',
      secret: process.env.VERIFYMY_SECRET || '',
      webhookSecret: process.env.VERIFYMY_WEBHOOK_SECRET || '',
      environment: (process.env.VERIFYMY_ENVIRONMENT as 'sandbox' | 'production') || 'production'
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.verifymyage.com/v1'
      : 'https://sandbox.verifymyage.com/v1';
  }

  /**
   * Generate HMAC signature for API requests
   */
  private generateSignature(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHmac('sha256', this.config.secret)
      .update(signatureString)
      .digest('hex');
  }

  /**
   * Start age verification flow for a user
   */
  async startAgeVerification(options: {
    userId: string;
    email: string;
    redirectUrl: string;
    webhookUrl?: string;
    stealth?: boolean;
  }): Promise<{ verificationUrl: string; sessionId: string }> {
    const params = {
      api_key: this.config.apiKey,
      user_id: options.userId,
      email: options.email,
      redirect_url: options.redirectUrl,
      webhook_url: options.webhookUrl || `${process.env.COMMAND_CENTER_URL}/api/webhooks/verifymy`,
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = this.generateSignature(params);

    try {
      const response = await fetch(`${this.baseUrl}/verification/start${options.stealth ? '?stealth=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification start failed');
      }

      return {
        verificationUrl: data.verification_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('[VerifyMy] Start verification error:', error);
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(sessionId: string): Promise<VerificationResult> {
    const params = {
      api_key: this.config.apiKey,
      session_id: sessionId,
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = this.generateSignature(params);

    try {
      const response = await fetch(`${this.baseUrl}/verification/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature
        }
      });

      const data = await response.json();

      return {
        success: response.ok,
        verified: data.status === 'verified',
        verificationId: data.verification_id,
        age: data.age,
        country: data.country,
        method: data.verification_method
      };
    } catch (error) {
      console.error('[VerifyMy] Check status error:', error);
      return { success: false, verified: false, error: String(error) };
    }
  }

  /**
   * Verify content creator identity and age
   */
  async verifyContentCreator(options: {
    creatorId: string;
    email: string;
    fullName: string;
    dateOfBirth: string;
    documentType: 'passport' | 'drivers_license' | 'national_id';
    redirectUrl: string;
  }): Promise<{ verificationUrl: string; sessionId: string }> {
    const params = {
      api_key: this.config.apiKey,
      creator_id: options.creatorId,
      email: options.email,
      full_name: options.fullName,
      date_of_birth: options.dateOfBirth,
      document_type: options.documentType,
      redirect_url: options.redirectUrl,
      verification_type: 'identity',
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = this.generateSignature(params);

    try {
      const response = await fetch(`${this.baseUrl}/identity/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      return {
        verificationUrl: data.verification_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('[VerifyMy] Creator verification error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process webhook callback
   */
  processWebhook(payload: any): VerificationResult {
    return {
      success: true,
      verified: payload.status === 'verified',
      verificationId: payload.verification_id,
      age: payload.age,
      country: payload.country,
      method: payload.method
    };
  }

  /**
   * Check if user needs re-verification (e.g., after 30 days)
   */
  needsReverification(lastVerifiedAt: Date, maxAgeDays: number = 30): boolean {
    const daysSinceVerification = (Date.now() - lastVerifiedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceVerification > maxAgeDays;
  }
}

export const verifyMyService = new VerifyMyService();
export type { VerificationResult, ContentVerification };
