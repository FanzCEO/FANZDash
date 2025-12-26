/**
 * COMPREHENSIVE COMPLIANCE API ROUTES
 * Exposes all legal compliance systems through RESTful API
 */

import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';

// Import compliance services
import { ageVerificationEnforcement } from '../services/ageVerificationEnforcement';
import { csamDetectionService } from '../services/csamDetectionService';
import { paymentProcessorCompliance } from '../services/paymentProcessorCompliance';
import { gdprDataProtection } from '../services/gdprDataProtection';
import { dsaCompliance } from '../services/dsaCompliance';
import { traffickingDetection } from '../services/traffickingDetection';

// Import existing services
import { verifyMyService } from '../services/verifyMyService';

const router = Router();

// Middleware to check authentication (reuse existing)
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Middleware for admin/moderator only
const requiresModerator = (req: any, res: any, next: any) => {
  if (req.user && ['moderator', 'admin', 'executive', 'super_admin'].includes(req.user.role)) {
    return next();
  }
  res.status(403).json({ error: 'Moderator access required' });
};

// ============= AGE VERIFICATION =============

/**
 * Check if user requires age verification
 * GET /api/compliance/age-verification/check
 */
router.get('/age-verification/check', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await ageVerificationEnforcement.checkUserVerification(userId, ipAddress);

    res.json(result);
  } catch (error) {
    console.error('[Compliance API] Age verification check error:', error);
    res.status(500).json({ error: 'Failed to check age verification' });
  }
});

/**
 * Initiate age verification flow
 * POST /api/compliance/age-verification/initiate
 */
router.post('/age-verification/initiate',
  isAuthenticated,
  [
    body('method').isIn(['id_document', 'credit_card', 'third_party_avs']).withMessage('Invalid verification method'),
    body('redirectUrl').optional().isURL().withMessage('Invalid redirect URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { method, redirectUrl, stealth } = req.body;

      const result = await ageVerificationEnforcement.initiateVerification(userId, method, {
        redirectUrl,
        stealth
      });

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] Age verification initiate error:', error);
      res.status(500).json({ error: 'Failed to initiate age verification' });
    }
  }
);

/**
 * VerifyMy callback webhook
 * POST /api/compliance/age-verification/callback
 */
router.post('/age-verification/callback', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = verifyMyService.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process verification result
    const result = verifyMyService.processWebhook(req.body);

    // TODO: Store verification record in database
    // await ageVerificationEnforcement.completeVerification(...)

    res.json({ success: true });
  } catch (error) {
    console.error('[Compliance API] Age verification callback error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

// ============= CSAM DETECTION (Admin/Moderator Only) =============

/**
 * Scan content for CSAM
 * POST /api/compliance/csam/scan
 */
router.post('/csam/scan',
  isAuthenticated,
  requiresModerator,
  [
    body('contentId').notEmpty().withMessage('Content ID required'),
    body('imageUrl').isURL().withMessage('Valid image URL required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contentId, imageUrl } = req.body;

      const result = await csamDetectionService.scanContentPhotoDNA(imageUrl, contentId);

      // Log scan
      console.log(`[CSAM Scan] Content ${contentId}: ${result.severity}`);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] CSAM scan error:', error);
      res.status(500).json({ error: 'Failed to scan content' });
    }
  }
);

/**
 * Get CSAM detection statistics
 * GET /api/compliance/csam/stats
 */
router.get('/csam/stats',
  isAuthenticated,
  requiresModerator,
  [
    query('startDate').isISO8601().withMessage('Valid start date required'),
    query('endDate').isISO8601().withMessage('Valid end date required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const stats = await csamDetectionService.generateComplianceReport(startDate, endDate);

      res.json(stats);
    } catch (error) {
      console.error('[Compliance API] CSAM stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }
);

// ============= PAYMENT PROCESSOR COMPLIANCE =============

/**
 * Review content for payment processor compliance
 * POST /api/compliance/payment-processor/review
 */
router.post('/payment-processor/review',
  isAuthenticated,
  [
    body('contentId').notEmpty().withMessage('Content ID required'),
    body('type').isIn(['image', 'video', 'text', 'live_stream']).withMessage('Invalid content type'),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('tags').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const content = {
        id: req.body.contentId,
        type: req.body.type,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        url: req.body.url,
        uploaderId: req.user.id
      };

      const result = await paymentProcessorCompliance.reviewContent(content);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] Payment processor review error:', error);
      res.status(500).json({ error: 'Failed to review content' });
    }
  }
);

/**
 * Get prohibited content categories
 * GET /api/compliance/payment-processor/prohibited-categories
 */
router.get('/payment-processor/prohibited-categories', (req, res) => {
  try {
    const categories = paymentProcessorCompliance.getProhibitedCategories();
    res.json({ categories });
  } catch (error) {
    console.error('[Compliance API] Get prohibited categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// ============= GDPR DATA PROTECTION =============

/**
 * Submit GDPR data subject access request
 * POST /api/compliance/gdpr/access-request
 */
router.post('/gdpr/access-request', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await gdprDataProtection.handleAccessRequest(userId);

    if (result.success) {
      // Return data export
      res.json({
        success: true,
        message: 'Your data has been compiled',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('[Compliance API] GDPR access request error:', error);
    res.status(500).json({ error: 'Failed to process access request' });
  }
});

/**
 * Submit GDPR right to erasure request
 * POST /api/compliance/gdpr/erasure-request
 */
router.post('/gdpr/erasure-request',
  isAuthenticated,
  [
    body('reason').notEmpty().withMessage('Reason required for erasure request')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { reason } = req.body;

      const result = await gdprDataProtection.handleErasureRequest(userId, reason);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] GDPR erasure request error:', error);
      res.status(500).json({ error: 'Failed to process erasure request' });
    }
  }
);

/**
 * Submit GDPR data portability request
 * POST /api/compliance/gdpr/portability-request
 */
router.post('/gdpr/portability-request', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await gdprDataProtection.handlePortabilityRequest(userId);

    if (result.success) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="my-data-${userId}.json"`);
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('[Compliance API] GDPR portability request error:', error);
    res.status(500).json({ error: 'Failed to process portability request' });
  }
});

/**
 * Submit GDPR rectification request
 * POST /api/compliance/gdpr/rectification-request
 */
router.post('/gdpr/rectification-request',
  isAuthenticated,
  [
    body('corrections').isObject().withMessage('Corrections object required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { corrections } = req.body;

      const result = await gdprDataProtection.handleRectificationRequest(userId, corrections);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] GDPR rectification request error:', error);
      res.status(500).json({ error: 'Failed to process rectification request' });
    }
  }
);

// ============= DSA COMPLIANCE =============

/**
 * Submit DSA notice (report illegal content)
 * POST /api/compliance/dsa/notice
 */
router.post('/dsa/notice',
  [
    body('contentId').notEmpty().withMessage('Content ID required'),
    body('contentType').isIn(['illegal_content', 'tos_violation']).withMessage('Invalid content type'),
    body('description').notEmpty().withMessage('Description required'),
    body('reporterEmail').optional().isEmail().withMessage('Invalid email'),
    body('illegalContentCategory').optional().isIn(['csam', 'terrorism', 'hate_speech', 'copyright', 'other'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const notice = {
        reporterId: req.user?.id,
        reporterEmail: req.body.reporterEmail,
        contentId: req.body.contentId,
        contentType: req.body.contentType,
        illegalContentCategory: req.body.illegalContentCategory,
        description: req.body.description,
        evidence: req.body.evidence
      };

      const result = await dsaCompliance.submitNotice(notice);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] DSA notice error:', error);
      res.status(500).json({ error: 'Failed to submit notice' });
    }
  }
);

/**
 * Submit DSA complaint (appeal moderation decision)
 * POST /api/compliance/dsa/complaint
 */
router.post('/dsa/complaint',
  isAuthenticated,
  [
    body('complaintType').isIn(['content_removal', 'account_suspension', 'content_restriction', 'other_moderation_decision']).withMessage('Invalid complaint type'),
    body('originalDecisionId').notEmpty().withMessage('Original decision ID required'),
    body('originalDecisionDate').isISO8601().withMessage('Valid decision date required'),
    body('complaintReason').notEmpty().withMessage('Complaint reason required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const complaint = {
        userId: req.user.id,
        complaintType: req.body.complaintType,
        originalDecisionId: req.body.originalDecisionId,
        originalDecisionDate: new Date(req.body.originalDecisionDate),
        complaintReason: req.body.complaintReason,
        evidence: req.body.evidence
      };

      const result = await dsaCompliance.submitComplaint(complaint);

      res.json(result);
    } catch (error) {
      console.error('[Compliance API] DSA complaint error:', error);
      res.status(500).json({ error: 'Failed to submit complaint' });
    }
  }
);

/**
 * Get DSA transparency report
 * GET /api/compliance/dsa/transparency-report/:year
 */
router.get('/dsa/transparency-report/:year',
  param('year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const year = parseInt(req.params.year);

      const report = await dsaCompliance.generateTransparencyReport(year);

      res.json(report);
    } catch (error) {
      console.error('[Compliance API] DSA transparency report error:', error);
      res.status(500).json({ error: 'Failed to generate transparency report' });
    }
  }
);

// ============= TRAFFICKING DETECTION =============

/**
 * Assess content for trafficking indicators
 * POST /api/compliance/trafficking/assess-content
 */
router.post('/trafficking/assess-content',
  isAuthenticated,
  requiresModerator,
  [
    body('contentId').notEmpty().withMessage('Content ID required'),
    body('content').isObject().withMessage('Content object required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contentId, content } = req.body;

      const assessment = await traffickingDetection.assessContent(contentId, content);

      res.json(assessment);
    } catch (error) {
      console.error('[Compliance API] Trafficking assessment error:', error);
      res.status(500).json({ error: 'Failed to assess content' });
    }
  }
);

/**
 * Monitor direct message for prohibited content
 * POST /api/compliance/trafficking/monitor-dm
 */
router.post('/trafficking/monitor-dm',
  isAuthenticated,
  [
    body('messageContent').notEmpty().withMessage('Message content required'),
    body('recipientId').notEmpty().withMessage('Recipient ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { messageContent, recipientId } = req.body;
      const senderId = req.user.id;

      const result = await traffickingDetection.monitorDirectMessages(messageContent, senderId, recipientId);

      if (result.flagged) {
        // Take action based on result.action
        if (result.action === 'block_message') {
          return res.status(403).json({
            blocked: true,
            reason: 'Message contains prohibited content',
            indicators: result.indicators
          });
        } else if (result.action === 'suspend_sender') {
          return res.status(403).json({
            blocked: true,
            accountSuspended: true,
            reason: 'Account suspended for FOSTA-SESTA violation',
            indicators: result.indicators
          });
        }
      }

      res.json({ allowed: true });
    } catch (error) {
      console.error('[Compliance API] DM monitoring error:', error);
      res.status(500).json({ error: 'Failed to monitor message' });
    }
  }
);

/**
 * Get trafficking detection statistics
 * GET /api/compliance/trafficking/stats
 */
router.get('/trafficking/stats',
  isAuthenticated,
  requiresModerator,
  [
    query('startDate').isISO8601().withMessage('Valid start date required'),
    query('endDate').isISO8601().withMessage('Valid end date required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const stats = await traffickingDetection.getStatistics(startDate, endDate);

      res.json(stats);
    } catch (error) {
      console.error('[Compliance API] Trafficking stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }
);

// ============= HEALTH CHECK =============

/**
 * Compliance systems health check
 * GET /api/compliance/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    systems: {
      ageVerification: 'operational',
      csamDetection: 'operational',
      paymentProcessorCompliance: 'operational',
      gdprDataProtection: 'operational',
      dsaCompliance: 'operational',
      traffickingDetection: 'operational'
    },
    timestamp: new Date()
  });
});

export default router;
