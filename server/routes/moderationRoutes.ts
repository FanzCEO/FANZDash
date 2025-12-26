/**
 * Content Moderation & Verification API Routes
 * Integrates VerifyMy and NSFW AI services
 */

import { Router, Request, Response } from 'express';
import { verifyMyService } from '../services/verifyMyService';
import { nsfwModerationService } from '../services/nsfwModerationService';

const router = Router();

// ============================================
// AGE & IDENTITY VERIFICATION (VerifyMy)
// ============================================

/**
 * Start age verification for a user
 */
router.post('/verification/age/start', async (req: Request, res: Response) => {
  try {
    const { userId, email, redirectUrl } = req.body;

    if (!userId || !email || !redirectUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, email, redirectUrl'
      });
    }

    const result = await verifyMyService.startAgeVerification({
      userId,
      email,
      redirectUrl,
      webhookUrl: `${process.env.COMMAND_CENTER_URL}/api/webhooks/verifymy`
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Verification] Age verification start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start age verification'
    });
  }
});

/**
 * Check verification status
 */
router.get('/verification/status/:sessionId', async (req: Request, res: Response) => {
  try {
    const result = await verifyMyService.checkVerificationStatus(req.params.sessionId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Verification] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check verification status'
    });
  }
});

/**
 * Start creator identity verification
 */
router.post('/verification/creator/start', async (req: Request, res: Response) => {
  try {
    const { creatorId, email, fullName, dateOfBirth, documentType, redirectUrl } = req.body;

    if (!creatorId || !email || !fullName || !dateOfBirth || !documentType || !redirectUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for creator verification'
      });
    }

    const result = await verifyMyService.verifyContentCreator({
      creatorId,
      email,
      fullName,
      dateOfBirth,
      documentType,
      redirectUrl
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Verification] Creator verification start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start creator verification'
    });
  }
});

/**
 * VerifyMy webhook handler
 */
router.post('/webhooks/verifymy', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyMyService.verifyWebhookSignature(payload, signature || '')) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const result = verifyMyService.processWebhook(req.body);

    // TODO: Update user verification status in database
    console.log('[Verification] Webhook received:', result);

    res.json({ received: true });

  } catch (error) {
    console.error('[Verification] Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================
// NSFW CONTENT MODERATION
// ============================================

/**
 * Moderate a single image
 */
router.post('/image', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: imageUrl'
      });
    }

    const result = await nsfwModerationService.moderate(imageUrl);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Moderation] Image moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate image'
    });
  }
});

/**
 * Moderate multiple images
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: imageUrls (array)'
      });
    }

    if (imageUrls.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 images per batch'
      });
    }

    const results = await nsfwModerationService.moderateBatch(imageUrls);

    res.json({
      success: true,
      data: {
        total: imageUrls.length,
        results: Object.fromEntries(results)
      }
    });

  } catch (error) {
    console.error('[Moderation] Batch moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate images'
    });
  }
});

/**
 * Moderate video
 */
router.post('/video', async (req: Request, res: Response) => {
  try {
    const { videoUrl, sampleFrames } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: videoUrl'
      });
    }

    const result = await nsfwModerationService.moderateVideo(videoUrl, sampleFrames || 10);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Moderation] Video moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate video'
    });
  }
});

/**
 * Get moderation service status
 */
router.get('/status', (req: Request, res: Response) => {
  const stats = nsfwModerationService.getStats();

  res.json({
    success: true,
    data: {
      providers: stats,
      primaryProvider: 'huggingface',
      fallbackProvider: 'sightengine'
    }
  });
});

/**
 * Health check endpoint for moderation service
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const stats = nsfwModerationService.getStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'moderation',
      providers: {
        huggingface: stats?.huggingface ? 'available' : 'unavailable',
        sightengine: stats?.sightengine ? 'available' : 'unavailable'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'moderation',
      error: 'Service unavailable'
    });
  }
});

export default router;
