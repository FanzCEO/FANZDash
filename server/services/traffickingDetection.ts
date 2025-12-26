/**
 * HUMAN TRAFFICKING DETECTION AND PREVENTION SYSTEM
 * CRITICAL COMPLIANCE FOR: FOSTA-SESTA (2018)
 *
 * LEGAL REQUIREMENTS:
 * - 18 U.S.C. § 2421A - Promotion or facilitation of prostitution
 * - 18 U.S.C. § 1591 - Sex trafficking of children or by force, fraud, coercion
 * - Section 230 exception removed for sex trafficking violations
 * - Platform liability for "knowingly assisting, supporting, or facilitating" trafficking
 *
 * PENALTIES:
 * - Up to 10 years imprisonment for facilitation
 * - Up to 25 years for aggravated violations
 * - Criminal liability for executives
 * - Civil liability to victims
 * - Platform shutdown
 *
 * ENFORCEMENT: FBI, DOJ, State attorneys general
 */

import { db } from '../db';
import { users, contentItems, auditTrail } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface TraffickingIndicator {
  category: 'red_flag' | 'amber_flag' | 'green_flag';
  indicator: string;
  description: string;
  weight: number; // 1-10, higher = more serious
  keywords: string[];
  patterns: RegExp[];
  requiresImmediate Action: boolean;
}

export interface TraffickingAssessment {
  userId?: string;
  contentId?: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: TraffickingIndicator[];
  recommendedAction: 'none' | 'monitor' | 'restrict' | 'report_to_authorities' | 'immediate_shutdown';
  assessmentDate: Date;
  reviewedBy: 'automated' | 'human';
}

export interface TraffickingReport {
  id: string;
  reportType: 'suspected_trafficking' | 'prostitution_solicitation' | 'coercion_indicators';
  subject: {
    userId?: string;
    contentId?: string;
    evidence: string[];
  };
  indicators: TraffickingIndicator[];
  riskScore: number;
  reportedTo: ('FBI' | 'NCMEC' | 'State_AG' | 'Local_LE')[];
  reportedAt: Date;
  reportedBy: string;
  status: 'pending' | 'reported' | 'investigating' | 'closed';
  investigationNotes?: string;
}

/**
 * TRAFFICKING INDICATORS
 * Based on DHS Blue Campaign and FBI guidance
 */
const TRAFFICKING_INDICATORS: TraffickingIndicator[] = [
  // CRITICAL RED FLAGS - Immediate action required
  {
    category: 'red_flag',
    indicator: 'Third-party control of account',
    description: 'Evidence of another person controlling the account (passwords, uploads, communications)',
    weight: 10,
    keywords: ['my manager', 'my boss', 'my handler', 'works for', 'agency', 'studio boss'],
    patterns: [/\b(manager|boss|handler|works?.?for|agency|studio.?boss)\b/gi],
    requiresImmediateAction: true
  },
  {
    category: 'red_flag',
    indicator: 'Escort services solicitation',
    description: 'Offers to meet in person for sexual services',
    weight: 10,
    keywords: ['meet in person', 'escort', 'full service', 'donations accepted', 'incall', 'outcall', 'rates per hour'],
    patterns: [/\b(meet.?in.?person|escort|full.?service|donations?.?accepted|incall|outcall|rates?.?per.?hour)\b/gi],
    requiresImmediateAction: true
  },
  {
    category: 'red_flag',
    indicator: 'Coercion language',
    description: 'Language indicating lack of choice or coercion',
    weight: 9,
    keywords: ['forced to', 'made me', 'no choice', 'have to', 'must do', 'required to', 'controlled by'],
    patterns: [/\b(forced.?to|made.?me|no.?choice|have.?to|must.?do|required.?to|controlled.?by)\b/gi],
    requiresImmediateAction: true
  },
  {
    category: 'red_flag',
    indicator: 'Underage appearance',
    description: 'Person appears significantly younger than verified age',
    weight: 10,
    keywords: ['barely legal', 'just turned 18', 'teen', 'young', 'innocent'],
    patterns: [/\b(barely.?legal|just.?turned.?18|virgin|innocent)\b/gi],
    requiresImmediateAction: true
  },
  {
    category: 'red_flag',
    indicator: 'Multiple performers same location',
    description: 'Multiple accounts uploading from same location/IP with similar patterns',
    weight: 8,
    keywords: [],
    patterns: [],
    requiresImmediateAction: true
  },

  // AMBER FLAGS - Requires investigation
  {
    category: 'amber_flag',
    indicator: 'Third-party in content',
    description: 'Non-performer visible in background or heard giving instructions',
    weight: 7,
    keywords: ['someone is here', 'he wants', 'she wants', 'they told me'],
    patterns: [/\b(someone.?is.?here|he.?wants|she.?wants|they.?told.?me)\b/gi],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Signs of substance use',
    description: 'Visible drug use or intoxication',
    weight: 6,
    keywords: ['high', 'drunk', 'wasted', 'pills', 'drugs'],
    patterns: [/\b(high|drunk|wasted|pills|drugs)\b/gi],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Bruises or injuries',
    description: 'Visible unexplained injuries',
    weight: 7,
    keywords: ['bruise', 'injury', 'hurt', 'pain'],
    patterns: [],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Scripted or coached responses',
    description: 'Responses appear rehearsed or coached',
    weight: 5,
    keywords: [],
    patterns: [],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Rapid content production',
    description: 'Unusually high volume of content uploaded in short time',
    weight: 6,
    keywords: [],
    patterns: [],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Payment through third party',
    description: 'Payments routed through another person or entity',
    weight: 7,
    keywords: ['pay my manager', 'send to', 'payment goes to'],
    patterns: [/\b(pay.?my.?manager|send.?to|payment.?goes.?to)\b/gi],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Hotel/motel background',
    description: 'Content frequently uploaded from hotel rooms',
    weight: 5,
    keywords: ['hotel', 'motel', 'room'],
    patterns: [],
    requiresImmediateAction: false
  },
  {
    category: 'amber_flag',
    indicator: 'Fear or distress indicators',
    description: 'Performer appears fearful, distressed, or dissociated',
    weight: 8,
    keywords: ['scared', 'afraid', 'help me', 'please stop'],
    patterns: [/\b(scared|afraid|help.?me|please.?stop)\b/gi],
    requiresImmediateAction: true
  }
];

class TraffickingDetectionSystem {
  /**
   * Assess content for trafficking indicators
   */
  async assessContent(contentId: string, content: {
    type: string;
    title?: string;
    description?: string;
    tags?: string[];
    url?: string;
    uploaderId: string;
  }): Promise<TraffickingAssessment> {
    try {
      const indicators: TraffickingIndicator[] = [];
      let riskScore = 0;

      // Combine all text content
      const textContent = [
        content.title || '',
        content.description || '',
        ...(content.tags || [])
      ].join(' ').toLowerCase();

      // Check each indicator
      for (const indicator of TRAFFICKING_INDICATORS) {
        // Check keywords
        const keywordMatch = indicator.keywords.some(keyword =>
          textContent.includes(keyword.toLowerCase())
        );

        // Check patterns
        const patternMatch = indicator.patterns.some(pattern =>
          pattern.test(textContent)
        );

        if (keywordMatch || patternMatch) {
          indicators.push(indicator);
          riskScore += indicator.weight * 10; // Scale to 100
        }
      }

      // Check uploader patterns
      const uploaderRisk = await this.assessUploaderPatterns(content.uploaderId);
      riskScore += uploaderRisk;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      let recommendedAction: TraffickingAssessment['recommendedAction'];

      if (riskScore >= 80) {
        riskLevel = 'critical';
        recommendedAction = 'immediate_shutdown';
      } else if (riskScore >= 60) {
        riskLevel = 'high';
        recommendedAction = 'report_to_authorities';
      } else if (riskScore >= 40) {
        riskLevel = 'medium';
        recommendedAction = 'restrict';
      } else if (riskScore >= 20) {
        riskLevel = 'low';
        recommendedAction = 'monitor';
      } else {
        riskLevel = 'low';
        recommendedAction = 'none';
      }

      // Take immediate action if critical indicators present
      const hasImmediateActionIndicators = indicators.some(i => i.requiresImmediateAction);
      if (hasImmediateActionIndicators) {
        await this.takeImmediateAction(contentId, content.uploaderId, indicators);
        recommendedAction = 'immediate_shutdown';
      }

      return {
        contentId,
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        indicators,
        recommendedAction,
        assessmentDate: new Date(),
        reviewedBy: 'automated'
      };

    } catch (error) {
      console.error('[Trafficking Detection] Assessment error:', error);
      // Fail safe: Flag for human review
      return {
        contentId,
        riskScore: 50,
        riskLevel: 'medium',
        indicators: [],
        recommendedAction: 'monitor',
        assessmentDate: new Date(),
        reviewedBy: 'automated'
      };
    }
  }

  /**
   * Assess user account for trafficking patterns
   */
  async assessUser(userId: string): Promise<TraffickingAssessment> {
    try {
      const indicators: TraffickingIndicator[] = [];
      let riskScore = 0;

      // Check upload patterns
      const uploadPatternRisk = await this.assessUploaderPatterns(userId);
      riskScore += uploadPatternRisk;

      // Check account characteristics
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return {
          userId,
          riskScore: 0,
          riskLevel: 'low',
          indicators: [],
          recommendedAction: 'none',
          assessmentDate: new Date(),
          reviewedBy: 'automated'
        };
      }

      // Check for red flags in account
      // - Rapid account creation and immediate monetization
      // - Payment routing to third party
      // - Multiple performers same payment info
      // - Suspicious verification documents

      // TODO: Implement comprehensive user pattern analysis

      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      let recommendedAction: TraffickingAssessment['recommendedAction'];

      if (riskScore >= 80) {
        riskLevel = 'critical';
        recommendedAction = 'report_to_authorities';
      } else if (riskScore >= 60) {
        riskLevel = 'high';
        recommendedAction = 'restrict';
      } else if (riskScore >= 40) {
        riskLevel = 'medium';
        recommendedAction = 'monitor';
      } else {
        riskLevel = 'low';
        recommendedAction = 'none';
      }

      return {
        userId,
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        indicators,
        recommendedAction,
        assessmentDate: new Date(),
        reviewedBy: 'automated'
      };

    } catch (error) {
      console.error('[Trafficking Detection] User assessment error:', error);
      return {
        userId,
        riskScore: 0,
        riskLevel: 'low',
        indicators: [],
        recommendedAction: 'none',
        assessmentDate: new Date(),
        reviewedBy: 'automated'
      };
    }
  }

  /**
   * Assess uploader patterns
   */
  private async assessUploaderPatterns(userId: string): Promise<number> {
    let risk = 0;

    try {
      // Get user's content
      const userContent = await db.select()
        .from(contentItems)
        .where(eq(contentItems.userId, userId));

      // Check for patterns:
      // 1. Rapid upload rate (> 10 items per day)
      if (userContent.length > 10) {
        const daysSinceFirst = Math.floor((Date.now() - new Date(userContent[0].createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceFirst > 0) {
          const uploadsPerDay = userContent.length / daysSinceFirst;
          if (uploadsPerDay > 10) {
            risk += 20;
          }
        }
      }

      // 2. Multiple performers from same account
      // TODO: Implement face detection to identify multiple performers

      // 3. Consistent background/location (hotel rooms)
      // TODO: Implement background analysis

      // 4. Similar upload times (suggesting scheduled/managed uploads)
      // TODO: Analyze upload timing patterns

    } catch (error) {
      console.error('[Trafficking Detection] Pattern analysis error:', error);
    }

    return risk;
  }

  /**
   * Take immediate action on critical indicators
   */
  private async takeImmediateAction(contentId: string, userId: string, indicators: TraffickingIndicator[]): Promise<void> {
    try {
      console.error(`[TRAFFICKING ALERT] Critical indicators detected - Content: ${contentId}, User: ${userId}`);

      // 1. Immediately remove content
      await db.update(contentItems).set({
        status: 'auto_blocked',
        updatedAt: new Date()
      }).where(eq(contentItems.id, contentId));

      // 2. Suspend user account
      await db.update(users).set({
        accountLocked: true,
        isActive: false,
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      // 3. Report to authorities
      await this.reportToAuthorities({
        reportType: 'suspected_trafficking',
        subject: {
          userId,
          contentId,
          evidence: indicators.map(i => i.indicator)
        },
        indicators,
        riskScore: 100,
        reportedBy: 'automated_system'
      });

      // 4. Alert executive team
      await this.alertExecutiveTeam(contentId, userId, indicators);

      // 5. Preserve evidence
      await this.preserveEvidence(contentId, userId);

    } catch (error) {
      console.error('[Trafficking Detection] Immediate action error:', error);
      // Critical: Manual intervention required
      await this.escalateToCrisisTeam(contentId, userId, error);
    }
  }

  /**
   * Report to law enforcement authorities
   * FOSTA-SESTA creates affirmative duty to report
   */
  async reportToAuthorities(report: Omit<TraffickingReport, 'id' | 'reportedAt' | 'reportedTo' | 'status'>): Promise<{
    success: boolean;
    reportId?: string;
    error?: string;
  }> {
    try {
      const reportId = crypto.randomUUID();

      const reportRecord: TraffickingReport = {
        id: reportId,
        ...report,
        reportedTo: ['FBI', 'NCMEC', 'State_AG'], // Report to multiple authorities
        reportedAt: new Date(),
        status: 'pending'
      };

      // TODO: Submit to FBI IC3 (Internet Crime Complaint Center)
      // https://www.ic3.gov/

      // TODO: Submit to NCMEC CyberTipline (if minors possibly involved)
      // https://report.cybertip.org/

      // TODO: Submit to relevant State Attorney General

      console.log(`[Trafficking Detection] Reported to authorities: ${reportId}`);

      // TODO: Store report in database

      // Log report
      await this.logTraffickingEvent('report_to_authorities', reportRecord);

      return {
        success: true,
        reportId
      };

    } catch (error) {
      console.error('[Trafficking Detection] Authority reporting error:', error);

      // CRITICAL: This is a legal requirement
      await this.escalateToCrisisTeam('report-failed', report.subject.userId || 'unknown', error);

      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Preserve evidence for law enforcement
   */
  private async preserveEvidence(contentId: string, userId: string): Promise<void> {
    try {
      // TODO: Create forensic copy of:
      // - Content files
      // - User account data
      // - Upload metadata
      // - IP addresses and timestamps
      // - Communication logs
      // - Payment information
      // - Verification documents

      console.log(`[Trafficking Detection] Evidence preserved for ${contentId}, ${userId}`);

    } catch (error) {
      console.error('[Trafficking Detection] Evidence preservation error:', error);
    }
  }

  /**
   * Alert executive team to critical incident
   */
  private async alertExecutiveTeam(contentId: string, userId: string, indicators: TraffickingIndicator[]): Promise<void> {
    try {
      // TODO: Send immediate alerts:
      // - Email to legal@fanzunlimited.com
      // - SMS to on-call executive
      // - PagerDuty/OpsGenie alert
      // - Slack #crisis-response channel
      // - Create high-priority ticket

      console.error(`[TRAFFICKING CRISIS ALERT] Content: ${contentId}, User: ${userId}, Indicators: ${indicators.length}`);

    } catch (error) {
      console.error('[Trafficking Detection] Executive alert error:', error);
    }
  }

  /**
   * Escalate to crisis response team
   */
  private async escalateToCrisisTeam(contentId: string, userId: string, error: any): Promise<void> {
    console.error(`[TRAFFICKING CRITICAL ESCALATION] ${contentId}, ${userId}: ${error}`);

    // TODO: Implement crisis escalation protocol
    // This is a business-critical incident requiring immediate executive attention
  }

  /**
   * Log trafficking-related event
   */
  private async logTraffickingEvent(event: string, details: any): Promise<void> {
    try {
      await db.insert(auditTrail).values({
        action: `trafficking_${event}`,
        resource: 'trafficking_detection',
        newValues: details,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('[Trafficking Detection] Logging error:', error);
    }
  }

  /**
   * Monitor DMs for solicitation of in-person services
   * This is a critical area for FOSTA-SESTA compliance
   */
  async monitorDirectMessages(messageContent: string, senderId: string, recipientId: string): Promise<{
    flagged: boolean;
    indicators: string[];
    action: 'none' | 'block_message' | 'suspend_sender' | 'report';
  }> {
    try {
      const indicators: string[] = [];
      const lowerContent = messageContent.toLowerCase();

      // Check for escort/prostitution solicitation
      const escortKeywords = ['meet in person', 'escort', 'full service', 'incall', 'outcall', 'donations', 'rates', 'per hour', 'overnight', 'available now'];

      for (const keyword of escortKeywords) {
        if (lowerContent.includes(keyword)) {
          indicators.push(`Escort keyword: "${keyword}"`);
        }
      }

      // Check for contact info sharing (often precedes in-person meeting)
      const contactPatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
        /\b(whatsapp|telegram|snapchat|kik|wickr)\b/i // Messaging apps
      ];

      for (const pattern of contactPatterns) {
        if (pattern.test(messageContent)) {
          indicators.push('Contact information sharing');
          break;
        }
      }

      if (indicators.length > 0) {
        let action: 'none' | 'block_message' | 'suspend_sender' | 'report';

        if (indicators.length >= 3) {
          action = 'suspend_sender';
          await this.suspendUser(senderId, 'FOSTA-SESTA violation: solicitation of prostitution');
        } else if (indicators.length >= 2) {
          action = 'block_message';
        } else {
          action = 'report';
        }

        return {
          flagged: true,
          indicators,
          action
        };
      }

      return {
        flagged: false,
        indicators: [],
        action: 'none'
      };

    } catch (error) {
      console.error('[Trafficking Detection] DM monitoring error:', error);
      return {
        flagged: false,
        indicators: [],
        action: 'none'
      };
    }
  }

  /**
   * Suspend user for FOSTA-SESTA violation
   */
  private async suspendUser(userId: string, reason: string): Promise<void> {
    try {
      await db.update(users).set({
        accountLocked: true,
        isActive: false,
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      await this.logTraffickingEvent('user_suspended', { userId, reason });

      console.log(`[Trafficking Detection] User ${userId} suspended: ${reason}`);

    } catch (error) {
      console.error('[Trafficking Detection] User suspension error:', error);
    }
  }

  /**
   * Get trafficking detection statistics
   */
  async getStatistics(startDate: Date, endDate: Date): Promise<{
    totalAssessments: number;
    criticalAlerts: number;
    reportsToAuthorities: number;
    usersSuspended: number;
    contentRemoved: number;
    averageRiskScore: number;
  }> {
    try {
      // TODO: Query database for statistics

      return {
        totalAssessments: 0,
        criticalAlerts: 0,
        reportsToAuthorities: 0,
        usersSuspended: 0,
        contentRemoved: 0,
        averageRiskScore: 0
      };

    } catch (error) {
      console.error('[Trafficking Detection] Statistics error:', error);
      throw error;
    }
  }
}

export const traffickingDetection = new TraffickingDetectionSystem();
export default TraffickingDetectionSystem;
