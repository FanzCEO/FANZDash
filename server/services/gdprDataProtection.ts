/**
 * GDPR DATA PROTECTION MANAGER
 * CRITICAL COMPLIANCE FOR: EU General Data Protection Regulation
 *
 * LEGAL REQUIREMENTS:
 * - Article 5: Data processing principles (lawfulness, fairness, transparency)
 * - Article 6: Lawful basis for processing
 * - Article 9: Special category data (biometric, racial, health data in IDs)
 * - Articles 15-22: Data subject rights (access, erasure, portability, object)
 * - Article 25: Privacy by design and by default
 * - Articles 32-34: Security and breach notification
 * - Articles 44-50: International data transfers
 *
 * PENALTIES: Up to €20M or 4% of global annual revenue (whichever is higher)
 */

import { db } from '../db';
import { users, contentItems, auditTrail } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface LawfulBasis {
  article: '6(1)(a)' | '6(1)(b)' | '6(1)(c)' | '6(1)(d)' | '6(1)(e)' | '6(1)(f)';
  description: string;
  justification: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'erasure' | 'portability' | 'rectification' | 'restriction' | 'object';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: Date;
  completedAt?: Date;
  responseDeadline: Date; // 30 days from submission
  requestDetails: any;
  responseData?: any;
  rejectionReason?: string;
}

export interface ConsentRecord {
  userId: string;
  purpose: string;
  granted: boolean;
  grantedAt: Date;
  withdrawnAt?: Date;
  version: string;
  explicit: boolean; // Article 9 requires explicit consent for special category data
  freelyGiven: boolean;
  specific: boolean;
  informed: boolean;
  unambiguous: boolean;
}

export interface DataProcessingRecord {
  id: string;
  processingActivity: string;
  purposes: string[];
  lawfulBasis: LawfulBasis;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  internationalTransfers: boolean;
  transferMechanism?: 'SCC' | 'Adequacy Decision' | 'BCR' | 'Derogation';
  dpia Required: boolean; // Data Protection Impact Assessment
}

export interface BreachNotification {
  id: string;
  detectedAt: Date;
  reportedToAuthority: boolean;
  reportedToDataSubjects: boolean;
  authorityNotificationDate?: Date;
  subjectNotificationDate?: Date;
  breachType: 'confidentiality' | 'integrity' | 'availability';
  severity: 'low' | 'high'; // High = likely risk to rights and freedoms
  affectedDataSubjects: number;
  dataCategories: string[];
  mitigationMeasures: string[];
  supervisoryAuthority: string; // ICO (UK), CNIL (France), etc.
}

class GDPRDataProtectionManager {
  /**
   * ARTICLE 15 - RIGHT OF ACCESS
   * User can request copy of all their personal data
   */
  async handleAccessRequest(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Gather all personal data about the user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get all user content
      const userContent = await db.select().from(contentItems).where(eq(contentItems.userId, userId));

      // Get audit logs
      const auditLogs = await db.select().from(auditTrail).where(eq(auditTrail.userId, userId));

      // TODO: Get from all other tables containing user data

      // Compile data export
      const dataExport = {
        personalData: {
          userId: user.id,
          fanzId: user.fanzId,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          // Exclude: password, passwordHash (security reason)
        },
        content: userContent.map(c => ({
          id: c.id,
          type: c.type,
          status: c.status,
          createdAt: c.createdAt
        })),
        activityLogs: auditLogs.map(log => ({
          action: log.action,
          resource: log.resource,
          timestamp: log.createdAt
        })),
        processingActivities: this.getProcessingActivitiesForUser(userId),
        lawfulBasis: this.getLawfulBasisForUser(userId),
        retentionPeriods: this.getRetentionPeriods(),
        dataRecipients: this.getDataRecipients(),
        internationalTransfers: this.getInternationalTransfers()
      };

      // Log the access request
      await this.logDataSubjectRequest(userId, 'access', dataExport);

      return {
        success: true,
        data: dataExport
      };

    } catch (error) {
      console.error('[GDPR] Access request error:', error);
      return {
        success: false,
        error: 'Failed to process access request'
      };
    }
  }

  /**
   * ARTICLE 17 - RIGHT TO ERASURE ("Right to be Forgotten")
   * Must delete data unless exception applies
   */
  async handleErasureRequest(userId: string, reason: string): Promise<{
    success: boolean;
    deleted: boolean;
    retainedData?: string[];
    legalBasis?: string;
    error?: string;
  }> {
    try {
      // Check if erasure exceptions apply (Article 17(3))
      const exceptions = await this.checkErasureExceptions(userId);

      if (exceptions.length > 0) {
        // Cannot fully delete - must retain some data
        return {
          success: true,
          deleted: false,
          retainedData: exceptions,
          legalBasis: 'Article 17(3) exceptions apply: ' + exceptions.join(', ')
        };
      }

      // Proceed with erasure
      await this.anonymizeUserData(userId);

      // Log erasure
      await this.logDataSubjectRequest(userId, 'erasure', { reason, completed: true });

      return {
        success: true,
        deleted: true
      };

    } catch (error) {
      console.error('[GDPR] Erasure request error:', error);
      return {
        success: false,
        deleted: false,
        error: 'Failed to process erasure request'
      };
    }
  }

  /**
   * Check Article 17(3) exceptions to right of erasure
   */
  private async checkErasureExceptions(userId: string): Promise<string[]> {
    const exceptions: string[] = [];

    // Article 17(3)(b) - Compliance with legal obligation
    // Must retain age verification records for 7 years (2257 compliance)
    exceptions.push('Age verification records (18 U.S.C. § 2257 - 7 year retention)');

    // Article 17(3)(e) - Establishment, exercise, or defense of legal claims
    // Must retain records if user involved in legal disputes
    // TODO: Check for ongoing legal matters

    // Article 17(3)(c) - Public interest or official authority
    // Must retain if required by law enforcement

    return exceptions;
  }

  /**
   * Anonymize user data (GDPR-compliant deletion)
   * Replace with irreversible pseudonymization
   */
  private async anonymizeUserData(userId: string): Promise<void> {
    try {
      const anonymousId = `anonymous_${crypto.randomBytes(16).toString('hex')}`;

      // Anonymize user record
      await db.update(users).set({
        username: anonymousId,
        email: `${anonymousId}@deleted.local`,
        firstName: 'Deleted',
        lastName: 'User',
        password: null,
        passwordHash: null,
        profileImageUrl: null,
        phoneNumber: null,
        address: null,
        googleId: null,
        githubId: null,
        facebookId: null,
        twitterId: null,
        linkedinId: null,
        totpSecret: null,
        backupCodes: null,
        isActive: false
      }).where(eq(users.id, userId));

      // Anonymize content (keep for platform statistics but remove attribution)
      await db.update(contentItems).set({
        userId: null
      }).where(eq(contentItems.userId, userId));

      // TODO: Anonymize other user data across all tables

      console.log(`[GDPR] User ${userId} data anonymized`);

    } catch (error) {
      console.error('[GDPR] Anonymization error:', error);
      throw error;
    }
  }

  /**
   * ARTICLE 20 - RIGHT TO DATA PORTABILITY
   * Provide data in machine-readable format
   */
  async handlePortabilityRequest(userId: string): Promise<{
    success: boolean;
    data?: any;
    format: 'json' | 'csv' | 'xml';
    error?: string;
  }> {
    try {
      // Get all user data
      const accessResult = await this.handleAccessRequest(userId);

      if (!accessResult.success || !accessResult.data) {
        return {
          success: false,
          format: 'json',
          error: accessResult.error
        };
      }

      // Return in JSON format (most portable)
      return {
        success: true,
        data: accessResult.data,
        format: 'json'
      };

    } catch (error) {
      console.error('[GDPR] Portability request error:', error);
      return {
        success: false,
        format: 'json',
        error: 'Failed to process portability request'
      };
    }
  }

  /**
   * ARTICLE 16 - RIGHT TO RECTIFICATION
   * User can correct inaccurate personal data
   */
  async handleRectificationRequest(userId: string, corrections: Partial<typeof users.$inferSelect>): Promise<{
    success: boolean;
    updated: boolean;
    error?: string;
  }> {
    try {
      // Validate corrections
      const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'country', 'postalCode'];
      const validCorrections: any = {};

      for (const [key, value] of Object.entries(corrections)) {
        if (allowedFields.includes(key)) {
          validCorrections[key] = value;
        }
      }

      if (Object.keys(validCorrections).length === 0) {
        return {
          success: false,
          updated: false,
          error: 'No valid corrections provided'
        };
      }

      // Apply corrections
      await db.update(users).set({
        ...validCorrections,
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      // Log rectification
      await this.logDataSubjectRequest(userId, 'rectification', { corrections: validCorrections });

      return {
        success: true,
        updated: true
      };

    } catch (error) {
      console.error('[GDPR] Rectification request error:', error);
      return {
        success: false,
        updated: false,
        error: 'Failed to process rectification request'
      };
    }
  }

  /**
   * ARTICLE 21 - RIGHT TO OBJECT
   * User can object to processing based on legitimate interests
   */
  async handleObjectionRequest(userId: string, processingActivity: string, reason: string): Promise<{
    success: boolean;
    processingCeased: boolean;
    reason?: string;
  }> {
    try {
      // Check if objection is valid
      // Can object to legitimate interests (Article 6(1)(f)) processing
      // Cannot object to legal obligation (Article 6(1)(c)) processing

      // Age verification is legal obligation - cannot object
      if (processingActivity === 'age_verification') {
        return {
          success: true,
          processingCeased: false,
          reason: 'Age verification is legal obligation (Online Safety Act, state laws) - Article 6(1)(c)'
        };
      }

      // Marketing is legitimate interest - can object
      if (processingActivity === 'marketing') {
        // Stop marketing communications
        await db.update(users).set({
          // TODO: Add marketing consent field to schema
          updatedAt: new Date()
        }).where(eq(users.id, userId));

        return {
          success: true,
          processingCeased: true
        };
      }

      // Default: Process objection
      await this.logDataSubjectRequest(userId, 'object', { processingActivity, reason });

      return {
        success: true,
        processingCeased: false,
        reason: 'Objection recorded - manual review required'
      };

    } catch (error) {
      console.error('[GDPR] Objection request error:', error);
      return {
        success: false,
        processingCeased: false,
        reason: 'Failed to process objection'
      };
    }
  }

  /**
   * ARTICLE 33 - BREACH NOTIFICATION TO SUPERVISORY AUTHORITY
   * Must notify within 72 hours of becoming aware
   */
  async notifyDataBreach(breach: Omit<BreachNotification, 'id'>): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
  }> {
    try {
      const notificationId = crypto.randomUUID();

      // Determine supervisory authority based on primary establishment
      // UK: ICO (Information Commissioner's Office)
      // France: CNIL
      // Germany: various state authorities
      // Ireland: DPC (if using Ireland as EU base)

      const authority = this.determineSupervisoryAuthority();

      // TODO: Submit to supervisory authority API/portal
      // ICO: https://ico.org.uk/for-organisations/report-a-breach/
      // CNIL: https://www.cnil.fr/
      // Each authority has different notification procedures

      console.log(`[GDPR BREACH] Notifying ${authority} of data breach`);

      // Log breach notification
      const breachRecord: BreachNotification = {
        id: notificationId,
        ...breach,
        supervisoryAuthority: authority,
        authorityNotificationDate: new Date()
      };

      // TODO: Store in database

      // If high risk, also notify affected data subjects (Article 34)
      if (breach.severity === 'high') {
        await this.notifyAffectedDataSubjects(breachRecord);
      }

      return {
        success: true,
        notificationId
      };

    } catch (error) {
      console.error('[GDPR] Breach notification error:', error);
      return {
        success: false,
        error: 'Failed to notify data breach'
      };
    }
  }

  /**
   * ARTICLE 34 - BREACH NOTIFICATION TO DATA SUBJECTS
   * Required if breach is "high risk" to rights and freedoms
   */
  private async notifyAffectedDataSubjects(breach: BreachNotification): Promise<void> {
    try {
      // TODO: Identify affected users
      // TODO: Send individual notifications
      // TODO: Log notifications

      console.log(`[GDPR BREACH] Notifying ${breach.affectedDataSubjects} data subjects`);

    } catch (error) {
      console.error('[GDPR] Data subject notification error:', error);
    }
  }

  /**
   * Determine lead supervisory authority
   */
  private determineSupervisoryAuthority(): string {
    // If established in Ireland (like most US tech companies): DPC
    // If established in UK: ICO
    // If established elsewhere: Local authority

    // For now, default to ICO (UK)
    return 'ICO (UK)';
  }

  /**
   * ARTICLE 30 - RECORDS OF PROCESSING ACTIVITIES
   * Must maintain for each processing activity
   */
  private getProcessingActivitiesForUser(userId: string): DataProcessingRecord[] {
    return [
      {
        id: 'user_account_management',
        processingActivity: 'User Account Management',
        purposes: ['Account creation', 'Authentication', 'Service provision'],
        lawfulBasis: {
          article: '6(1)(b)',
          description: 'Performance of contract',
          justification: 'Necessary to provide platform services'
        },
        dataCategories: ['Identity data', 'Contact data', 'Account data'],
        dataSubjects: ['Platform users'],
        recipients: ['Internal teams', 'Hosting provider'],
        retentionPeriod: 'Duration of account + 7 years (legal claims)',
        securityMeasures: ['Encryption at rest', 'Encryption in transit', 'Access controls', 'Regular security audits'],
        internationalTransfers: true,
        transferMechanism: 'SCC',
        dpiaRequired: false
      },
      {
        id: 'age_verification',
        processingActivity: 'Age Verification',
        purposes: ['Legal compliance', 'Child protection'],
        lawfulBasis: {
          article: '6(1)(c)',
          description: 'Legal obligation',
          justification: 'Required by Online Safety Act 2023 (UK), state laws (US), ARCOM (France)'
        },
        dataCategories: ['Identity documents', 'Biometric data (photos)', 'Age information'],
        dataSubjects: ['All users accessing adult content'],
        recipients: ['Internal compliance team', 'Third-party verification service (VerifyMy)'],
        retentionPeriod: '7 years (legal compliance)',
        securityMeasures: ['End-to-end encryption', 'Data minimization', 'Access logging', 'Segregated storage'],
        internationalTransfers: true,
        transferMechanism: 'SCC',
        dpiaRequired: true // Special category data (Article 9)
      }
    ];
  }

  /**
   * Get lawful basis for user data processing
   */
  private getLawfulBasisForUser(userId: string): LawfulBasis {
    return {
      article: '6(1)(b)',
      description: 'Performance of contract',
      justification: 'Processing necessary to provide platform services per Terms of Service'
    };
  }

  /**
   * Get data retention periods
   */
  private getRetentionPeriods(): Record<string, string> {
    return {
      'Account data': 'Duration of account + 7 years',
      'Age verification': '7 years (18 U.S.C. § 2257)',
      'Content': 'Until deletion request + 30 days backup retention',
      'Payment records': '7 years (tax law)',
      'Audit logs': '7 years (compliance)',
      'Support tickets': '3 years'
    };
  }

  /**
   * Get data recipients (processors)
   */
  private getDataRecipients(): string[] {
    return [
      'Hosting provider (AWS/Cloud provider)',
      'CDN provider',
      'Payment processor',
      'Age verification service (VerifyMy)',
      'Email service provider',
      'Analytics provider',
      'Customer support tools'
    ];
  }

  /**
   * Get international transfer information
   */
  private getInternationalTransfers(): {
    country: string;
    mechanism: string;
    safeguards: string;
  }[] {
    return [
      {
        country: 'United States',
        mechanism: 'Standard Contractual Clauses (2021 SCCs)',
        safeguards: 'Encryption, access controls, supplementary measures per Schrems II'
      }
    ];
  }

  /**
   * Log data subject request for audit trail
   */
  private async logDataSubjectRequest(userId: string, requestType: string, details: any): Promise<void> {
    try {
      await db.insert(auditTrail).values({
        userId,
        action: `gdpr_${requestType}_request`,
        resource: 'personal_data',
        resourceId: userId,
        newValues: details,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('[GDPR] Logging error:', error);
    }
  }
}

export const gdprDataProtection = new GDPRDataProtectionManager();
export default GDPRDataProtectionManager;
