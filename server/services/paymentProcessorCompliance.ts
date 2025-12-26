/**
 * PAYMENT PROCESSOR CONTENT COMPLIANCE SYSTEM
 * CRITICAL FOR: Visa/Mastercard compliance - Loss of payment processing = business shutdown
 *
 * VISA GLOBAL BRAND PROTECTION PROGRAM REQUIREMENTS:
 * - 100% content review before publication (or representative sampling with automated tools)
 * - Prohibited content categories strictly enforced
 * - Quarterly compliance reporting
 * - Annual PCI audits
 * - Creator verification and documentation
 *
 * CONSEQUENCES OF NON-COMPLIANCE:
 * - Placement on MATCH list (terminated merchant file)
 * - Loss of card payment processing permanently
 * - Withheld reserves
 * - Contract termination
 *
 * PENALTY: Business-ending - Cannot accept Visa/Mastercard globally
 */

export interface ProhibitedContentCategory {
  category: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  severity: 'high' | 'critical';
  autoBlock: boolean;
  visaReference: string;
  mastercardReference: string;
}

export interface ContentReviewResult {
  approved: boolean;
  requiresHumanReview: boolean;
  violations: ProhibitedContentCategory[];
  riskScore: number;
  reviewedBy: 'automated' | 'human' | 'both';
  timestamp: Date;
  notes?: string;
}

export interface ProcessorComplianceReport {
  reportPeriod: { start: Date; end: Date };
  totalContent: number;
  reviewedContent: number;
  approvedContent: number;
  rejectedContent: number;
  prohibitedCategories: Record<string, number>;
  averageReviewTime: number;
  humanReviewRate: number;
  complianceScore: number;
}

/**
 * VISA/MASTERCARD PROHIBITED CONTENT CATEGORIES
 * These are MORE RESTRICTIVE than legal requirements
 */
const PROHIBITED_CONTENT_CATEGORIES: ProhibitedContentCategory[] = [
  {
    category: 'Non-Consensual Content',
    description: 'Content depicting or suggesting lack of consent',
    keywords: ['non-consent', 'unwilling', 'forced', 'against will', 'drugged', 'sleeping', 'unconscious', 'passed out'],
    patterns: [/\b(non.?consent|unwilling|forced|against.?will|drugged|sleeping|unconscious)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.1',
    mastercardReference: 'Brand Protection Policy 4.2'
  },
  {
    category: 'Minors or Appearing to be Minors',
    description: 'Any content involving or appearing to involve persons under 18',
    keywords: ['minor', 'underage', 'teen', 'young', 'school', 'student', 'barely legal'],
    patterns: [/\b(minor|underage|teen|young|school|student|barely.?legal|18.?year.?old)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.2',
    mastercardReference: 'Brand Protection Policy 4.1'
  },
  {
    category: 'Incest (Even Simulated/Roleplay)',
    description: 'Any incest themes including step-family roleplay',
    keywords: ['incest', 'sister', 'brother', 'mom', 'dad', 'daughter', 'son', 'step-mom', 'step-dad', 'step-sister', 'step-brother', 'family'],
    patterns: [/\b(incest|step.?mom|step.?dad|step.?sister|step.?brother|family.?affair)\b/gi],
    severity: 'high',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.3',
    mastercardReference: 'Brand Protection Policy 4.3'
  },
  {
    category: 'Bestiality',
    description: 'Sexual contact with animals',
    keywords: ['bestiality', 'zoophilia', 'animal'],
    patterns: [/\b(bestiality|zoophilia|animal.?sex)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.4',
    mastercardReference: 'Brand Protection Policy 4.4'
  },
  {
    category: 'Rape or Sexual Violence',
    description: 'Depictions of rape, sexual assault, or extreme violence',
    keywords: ['rape', 'sexual assault', 'abduction', 'kidnap', 'torture', 'brutal', 'extreme violence'],
    patterns: [/\b(rape|sexual.?assault|abduct|kidnap|torture)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.5',
    mastercardReference: 'Brand Protection Policy 4.5'
  },
  {
    category: 'Intoxication/Impairment',
    description: 'Content depicting intoxicated or impaired individuals',
    keywords: ['drunk', 'intoxicated', 'drugged', 'high', 'wasted', 'impaired', 'pills', 'alcohol'],
    patterns: [/\b(drunk|intoxicated|drugged|high|wasted|impaired)\b/gi],
    severity: 'high',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.6',
    mastercardReference: 'Brand Protection Policy 4.6'
  },
  {
    category: 'Hypnosis/Sleep/Unconsciousness',
    description: 'Content depicting hypnotized, sleeping, or unconscious individuals',
    keywords: ['hypnosis', 'hypnotized', 'sleeping', 'asleep', 'unconscious', 'passed out'],
    patterns: [/\b(hypnosis|hypnotized|sleeping|asleep|unconscious|passed.?out)\b/gi],
    severity: 'high',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.7',
    mastercardReference: 'Brand Protection Policy 4.7'
  },
  {
    category: 'Escort Services',
    description: 'Arrangement of in-person sexual services',
    keywords: ['escort', 'prostitution', 'meet up', 'in person', 'full service', 'donations accepted'],
    patterns: [/\b(escort|prostitution|meet.?up|in.?person|full.?service|donations?.?accepted)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.8',
    mastercardReference: 'Brand Protection Policy 4.8'
  },
  {
    category: 'Trafficking Indicators',
    description: 'Signs of human trafficking or coercion',
    keywords: ['traffick', 'coerced', 'forced to', 'no choice', 'must do', 'made to'],
    patterns: [/\b(traffick|coerced|forced.?to|no.?choice|must.?do|made.?to)\b/gi],
    severity: 'critical',
    autoBlock: true,
    visaReference: 'GBPP Section 3.1.9',
    mastercardReference: 'Brand Protection Policy 4.9'
  }
];

class PaymentProcessorComplianceSystem {
  /**
   * Review content before publication (REQUIRED by Visa/Mastercard)
   */
  async reviewContent(content: {
    id: string;
    type: 'image' | 'video' | 'text' | 'live_stream';
    url?: string;
    title?: string;
    description?: string;
    tags?: string[];
    uploaderId: string;
  }): Promise<ContentReviewResult> {
    try {
      const violations: ProhibitedContentCategory[] = [];
      let riskScore = 0;

      // Scan title and description for prohibited keywords
      const textContent = [
        content.title || '',
        content.description || '',
        ...(content.tags || [])
      ].join(' ').toLowerCase();

      for (const category of PROHIBITED_CONTENT_CATEGORIES) {
        // Check keywords
        const keywordMatch = category.keywords.some(keyword =>
          textContent.includes(keyword.toLowerCase())
        );

        // Check patterns
        const patternMatch = category.patterns.some(pattern =>
          pattern.test(textContent)
        );

        if (keywordMatch || patternMatch) {
          violations.push(category);

          // Calculate risk score
          if (category.severity === 'critical') {
            riskScore += 50;
          } else if (category.severity === 'high') {
            riskScore += 30;
          }
        }
      }

      // Auto-block if critical violations found
      const hasCriticalViolations = violations.some(v => v.autoBlock);

      // Require human review if risk score above threshold
      const requiresHumanReview = riskScore >= 30 && riskScore < 80;

      // Auto-reject if risk score very high
      const autoReject = riskScore >= 80;

      return {
        approved: !hasCriticalViolations && !autoReject && riskScore < 30,
        requiresHumanReview,
        violations,
        riskScore: Math.min(riskScore, 100),
        reviewedBy: requiresHumanReview ? 'automated' : 'automated',
        timestamp: new Date(),
        notes: violations.length > 0 ? `Violations: ${violations.map(v => v.category).join(', ')}` : undefined
      };

    } catch (error) {
      console.error('[Payment Compliance] Content review error:', error);
      // Fail safe: Require human review
      return {
        approved: false,
        requiresHumanReview: true,
        violations: [],
        riskScore: 50,
        reviewedBy: 'automated',
        timestamp: new Date(),
        notes: 'Review error - manual review required'
      };
    }
  }

  /**
   * Verify creator compliance with payment processor requirements
   */
  async verifyCreatorCompliance(creatorId: string): Promise<{
    compliant: boolean;
    issues: string[];
    requirements: {
      ageVerification: boolean;
      identityVerification: boolean;
      form2257: boolean;
      consentDocumentation: boolean;
      noProhibitedContent: boolean;
    };
  }> {
    try {
      const issues: string[] = [];
      const requirements = {
        ageVerification: false,
        identityVerification: false,
        form2257: false,
        consentDocumentation: false,
        noProhibitedContent: false
      };

      // TODO: Check creator verification status
      // TODO: Check 2257 records
      // TODO: Check content history for violations
      // TODO: Check consent documentation

      const compliant = Object.values(requirements).every(r => r === true);

      return {
        compliant,
        issues,
        requirements
      };

    } catch (error) {
      console.error('[Payment Compliance] Creator verification error:', error);
      return {
        compliant: false,
        issues: ['Verification error'],
        requirements: {
          ageVerification: false,
          identityVerification: false,
          form2257: false,
          consentDocumentation: false,
          noProhibitedContent: false
        }
      };
    }
  }

  /**
   * Generate quarterly compliance report for payment processor
   * REQUIRED by Visa/Mastercard
   */
  async generateQuarterlyReport(quarter: number, year: number): Promise<ProcessorComplianceReport> {
    try {
      const startDate = new Date(year, (quarter - 1) * 3, 1);
      const endDate = new Date(year, quarter * 3, 0);

      // TODO: Query database for statistics

      const report: ProcessorComplianceReport = {
        reportPeriod: { start: startDate, end: endDate },
        totalContent: 0,
        reviewedContent: 0,
        approvedContent: 0,
        rejectedContent: 0,
        prohibitedCategories: {},
        averageReviewTime: 0,
        humanReviewRate: 0,
        complianceScore: 0
      };

      // Calculate compliance score
      if (report.totalContent > 0) {
        const reviewRate = (report.reviewedContent / report.totalContent) * 100;
        const rejectionRate = (report.rejectedContent / report.reviewedContent) * 100;
        report.complianceScore = Math.min(reviewRate + (100 - rejectionRate), 100);
      }

      return report;

    } catch (error) {
      console.error('[Payment Compliance] Report generation error:', error);
      throw error;
    }
  }

  /**
   * Monitor content for ongoing compliance
   * Payment processors require continuous monitoring, not just pre-publication review
   */
  async monitorOngoingCompliance(): Promise<{
    flaggedContent: string[];
    actionsTaken: number;
    complianceRate: number;
  }> {
    try {
      // TODO: Scan existing content for newly prohibited categories
      // TODO: Check for creator violations
      // TODO: Review user reports
      // TODO: Automated pattern detection

      return {
        flaggedContent: [],
        actionsTaken: 0,
        complianceRate: 100
      };

    } catch (error) {
      console.error('[Payment Compliance] Monitoring error:', error);
      return {
        flaggedContent: [],
        actionsTaken: 0,
        complianceRate: 0
      };
    }
  }

  /**
   * Handle payment processor audit
   */
  async prepareForAudit(): Promise<{
    documentationReady: boolean;
    complianceScore: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check all audit requirements:
      // 1. Content review documentation
      // 2. Creator verification records
      // 3. Prohibited content removal logs
      // 4. Training records for moderation team
      // 5. Compliance reports

      // TODO: Implement comprehensive audit preparation

      const complianceScore = 100 - (issues.length * 10);

      return {
        documentationReady: issues.length === 0,
        complianceScore: Math.max(complianceScore, 0),
        issues,
        recommendations
      };

    } catch (error) {
      console.error('[Payment Compliance] Audit preparation error:', error);
      return {
        documentationReady: false,
        complianceScore: 0,
        issues: ['Audit preparation failed'],
        recommendations: ['Consult with payment processing compliance specialist']
      };
    }
  }

  /**
   * Get prohibited content categories for display to creators
   */
  getProhibitedCategories(): ProhibitedContentCategory[] {
    return PROHIBITED_CONTENT_CATEGORIES;
  }

  /**
   * Check if content type is allowed
   */
  isContentTypeAllowed(contentType: string, metadata?: any): {
    allowed: boolean;
    reason?: string;
  } {
    // Completely prohibited content types
    const prohibitedTypes = [
      'escort',
      'prostitution',
      'trafficking',
      'csam',
      'bestiality',
      'necrophilia'
    ];

    if (prohibitedTypes.includes(contentType.toLowerCase())) {
      return {
        allowed: false,
        reason: `Content type '${contentType}' is prohibited by payment processors`
      };
    }

    return { allowed: true };
  }
}

export const paymentProcessorCompliance = new PaymentProcessorComplianceSystem();
export default PaymentProcessorComplianceSystem;
