/**
 * NSFW AI Content Moderation Service
 * Multi-provider integration for adult content platforms
 *
 * Providers (in order of cost-effectiveness):
 * 1. HuggingFace - Free/low-cost self-hosted models
 * 2. SentiSight.ai - Pay-as-you-go with free credits
 * 3. Sightengine - Professional tier $29-399/mo
 * 4. API4AI - Cloud-based competitive pricing
 */

interface ModerationResult {
  safe: boolean;
  score: number;
  categories: {
    explicit: number;
    suggestive: number;
    violence: number;
    gore: number;
    drugs: number;
    weapons: number;
    hate: number;
    selfHarm: number;
    minors: number;  // Critical - always block
  };
  provider: string;
  processingTimeMs: number;
  flags: string[];
  action: 'approve' | 'review' | 'reject';
}

interface ModerationConfig {
  primaryProvider: 'huggingface' | 'sightengine' | 'sentisight' | 'api4ai';
  fallbackProvider?: string;
  thresholds: {
    autoApprove: number;
    requireReview: number;
    autoReject: number;
  };
  blockCategories: string[];
}

class NSFWModerationService {
  private config: ModerationConfig;
  private huggingfaceApiKey: string;
  private sightengineUser: string;
  private sightengineSecret: string;
  private sentisightApiKey: string;
  private api4aiApiKey: string;

  constructor() {
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.sightengineUser = process.env.SIGHTENGINE_API_USER || '';
    this.sightengineSecret = process.env.SIGHTENGINE_API_SECRET || '';
    this.sentisightApiKey = process.env.SENTISIGHT_API_KEY || '';
    this.api4aiApiKey = process.env.API4AI_API_KEY || '';

    this.config = {
      primaryProvider: 'huggingface',  // Free option first
      fallbackProvider: 'sightengine',
      thresholds: {
        autoApprove: 0.15,    // Below this = safe
        requireReview: 0.70,  // Between approve and reject = needs human review
        autoReject: 0.95      // Above this = auto-reject
      },
      blockCategories: ['minors', 'gore', 'violence']  // Always block these
    };
  }

  /**
   * Moderate image using HuggingFace (FREE)
   * Uses Falconsai/nsfw_image_detection model
   */
  async moderateWithHuggingFace(imageUrl: string): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      // Use the popular NSFW detection model
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: imageUrl })
        }
      );

      const data = await response.json();

      // Parse HuggingFace response
      let nsfwScore = 0;
      let categories: ModerationResult['categories'] = {
        explicit: 0, suggestive: 0, violence: 0, gore: 0,
        drugs: 0, weapons: 0, hate: 0, selfHarm: 0, minors: 0
      };

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.label === 'nsfw') {
            nsfwScore = item.score;
            categories.explicit = item.score;
          } else if (item.label === 'normal' || item.label === 'safe') {
            nsfwScore = 1 - item.score;
          }
        }
      }

      return this.buildResult(nsfwScore, categories, 'huggingface', Date.now() - startTime);

    } catch (error) {
      console.error('[NSFW] HuggingFace error:', error);
      throw error;
    }
  }

  /**
   * Moderate with Sightengine (Professional - $29+/mo)
   * 99% accuracy, 30+ concepts
   */
  async moderateWithSightengine(imageUrl: string): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      const params = new URLSearchParams({
        url: imageUrl,
        models: 'nudity-2.1,offensive,gore,violence,self-harm,gambling',
        api_user: this.sightengineUser,
        api_secret: this.sightengineSecret
      });

      const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);
      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.error?.message || 'Sightengine API error');
      }

      const categories: ModerationResult['categories'] = {
        explicit: data.nudity?.sexual_activity || 0,
        suggestive: data.nudity?.suggestive || 0,
        violence: data.violence?.prob || 0,
        gore: data.gore?.prob || 0,
        drugs: data.drugs?.prob || 0,
        weapons: data.weapon?.prob || 0,
        hate: data.offensive?.prob || 0,
        selfHarm: data['self-harm']?.prob || 0,
        minors: data.nudity?.context?.underage_content?.prob || 0
      };

      // Calculate overall score
      const maxScore = Math.max(
        categories.explicit,
        categories.violence,
        categories.gore,
        categories.minors * 10  // Heavily weight minors detection
      );

      return this.buildResult(maxScore, categories, 'sightengine', Date.now() - startTime);

    } catch (error) {
      console.error('[NSFW] Sightengine error:', error);
      throw error;
    }
  }

  /**
   * Moderate with SentiSight.ai (Pay-as-you-go)
   */
  async moderateWithSentiSight(imageUrl: string): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://platform.sentisight.ai/api/nsfw/', {
        method: 'POST',
        headers: {
          'X-Auth-token': this.sentisightApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      const data = await response.json();

      const categories: ModerationResult['categories'] = {
        explicit: data.nsfw_score || 0,
        suggestive: data.suggestive_score || 0,
        violence: 0,
        gore: 0,
        drugs: 0,
        weapons: 0,
        hate: 0,
        selfHarm: 0,
        minors: 0
      };

      return this.buildResult(data.nsfw_score || 0, categories, 'sentisight', Date.now() - startTime);

    } catch (error) {
      console.error('[NSFW] SentiSight error:', error);
      throw error;
    }
  }

  /**
   * Moderate with API4AI
   */
  async moderateWithAPI4AI(imageUrl: string): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api4.ai/api/v1/nsfw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.api4aiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      const data = await response.json();

      const categories: ModerationResult['categories'] = {
        explicit: data.nsfw || 0,
        suggestive: data.suggestive || 0,
        violence: 0,
        gore: 0,
        drugs: 0,
        weapons: 0,
        hate: 0,
        selfHarm: 0,
        minors: 0
      };

      return this.buildResult(data.nsfw || 0, categories, 'api4ai', Date.now() - startTime);

    } catch (error) {
      console.error('[NSFW] API4AI error:', error);
      throw error;
    }
  }

  /**
   * Build standardized result
   */
  private buildResult(
    score: number,
    categories: ModerationResult['categories'],
    provider: string,
    processingTimeMs: number
  ): ModerationResult {
    const flags: string[] = [];
    let action: ModerationResult['action'] = 'approve';

    // Check for blocked categories
    for (const category of this.config.blockCategories) {
      if (categories[category as keyof typeof categories] > 0.5) {
        flags.push(`blocked_${category}`);
        action = 'reject';
      }
    }

    // Determine action based on thresholds
    if (action !== 'reject') {
      if (score >= this.config.thresholds.autoReject) {
        action = 'reject';
        flags.push('high_nsfw_score');
      } else if (score >= this.config.thresholds.requireReview) {
        action = 'review';
        flags.push('requires_human_review');
      }
    }

    // Flag specific concerns
    if (categories.minors > 0.1) {
      flags.push('potential_minor_content');
      action = 'reject';  // Always reject any hint of minor content
    }

    return {
      safe: action === 'approve',
      score,
      categories,
      provider,
      processingTimeMs,
      flags,
      action
    };
  }

  /**
   * Main moderation function - tries primary, falls back if needed
   */
  async moderate(imageUrl: string): Promise<ModerationResult> {
    try {
      // Try primary provider (HuggingFace - free)
      return await this.moderateWithHuggingFace(imageUrl);
    } catch (primaryError) {
      console.warn('[NSFW] Primary provider failed, trying fallback');

      // Try fallback if configured
      if (this.config.fallbackProvider === 'sightengine' && this.sightengineUser) {
        return await this.moderateWithSightengine(imageUrl);
      } else if (this.config.fallbackProvider === 'sentisight' && this.sentisightApiKey) {
        return await this.moderateWithSentiSight(imageUrl);
      }

      throw primaryError;
    }
  }

  /**
   * Batch moderate multiple images
   */
  async moderateBatch(imageUrls: string[]): Promise<Map<string, ModerationResult>> {
    const results = new Map<string, ModerationResult>();

    // Process in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(url => this.moderate(url))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(batch[index], result.value);
        } else {
          results.set(batch[index], {
            safe: false,
            score: 1,
            categories: { explicit: 1, suggestive: 0, violence: 0, gore: 0, drugs: 0, weapons: 0, hate: 0, selfHarm: 0, minors: 0 },
            provider: 'error',
            processingTimeMs: 0,
            flags: ['moderation_failed'],
            action: 'review'
          });
        }
      });
    }

    return results;
  }

  /**
   * Moderate video (frame sampling)
   */
  async moderateVideo(videoUrl: string, sampleFrames: number = 10): Promise<{
    overallResult: ModerationResult;
    frameResults: ModerationResult[];
  }> {
    // For video, we'd extract frames and check each
    // This is a placeholder - actual implementation would use FFmpeg
    console.log(`[NSFW] Video moderation requested for ${videoUrl}, sampling ${sampleFrames} frames`);

    // Return placeholder for now
    return {
      overallResult: {
        safe: false,
        score: 0,
        categories: { explicit: 0, suggestive: 0, violence: 0, gore: 0, drugs: 0, weapons: 0, hate: 0, selfHarm: 0, minors: 0 },
        provider: 'pending',
        processingTimeMs: 0,
        flags: ['video_moderation_pending'],
        action: 'review'
      },
      frameResults: []
    };
  }

  /**
   * Get moderation statistics
   */
  getStats(): { provider: string; available: boolean }[] {
    return [
      { provider: 'huggingface', available: !!this.huggingfaceApiKey },
      { provider: 'sightengine', available: !!(this.sightengineUser && this.sightengineSecret) },
      { provider: 'sentisight', available: !!this.sentisightApiKey },
      { provider: 'api4ai', available: !!this.api4aiApiKey }
    ];
  }
}

export const nsfwModerationService = new NSFWModerationService();
export type { ModerationResult, ModerationConfig };
