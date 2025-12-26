/**
 * AGE VERIFICATION MIDDLEWARE
 * Enforces age verification before accessing adult content
 *
 * LEGAL REQUIREMENT: UK Online Safety Act, US State Laws, EU regulations
 * PENALTY: £18M or 10% revenue (UK), $5K+ per violation (US states)
 */

import { Request, Response, NextFunction } from 'express';
import { ageVerificationEnforcement } from '../services/ageVerificationEnforcement';

export interface AgeVerificationRequest extends Request {
  user?: any;
  ageVerified?: boolean;
  jurisdiction?: any;
}

/**
 * Middleware: Require age verification for adult content access
 * Add to routes that serve adult content
 */
export const requireAgeVerification = async (
  req: AgeVerificationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user ID (if authenticated)
    const userId = req.user?.id;

    // Get IP address for geolocation
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        message: 'You must be logged in to access adult content'
      });
    }

    // Check age verification status
    const verification = await ageVerificationEnforcement.checkUserVerification(userId, ipAddress);

    if (!verification.requiresVerification) {
      // Jurisdiction doesn't require verification
      req.ageVerified = true;
      return next();
    }

    if (verification.verified) {
      // User is verified
      req.ageVerified = true;
      req.jurisdiction = verification.jurisdiction;
      return next();
    }

    // User not verified - block access
    return res.status(403).json({
      error: 'Age verification required',
      code: 'AGE_VERIFICATION_REQUIRED',
      message: verification.error || 'Age verification is required to access this content',
      jurisdiction: verification.jurisdiction,
      verificationMethods: verification.jurisdiction?.verificationMethods || [],
      legalReference: verification.jurisdiction?.legalReference,
      initiateVerificationUrl: '/api/compliance/age-verification/initiate'
    });

  } catch (error) {
    console.error('[Age Verification Middleware] Error:', error);

    // Fail closed - deny access on error
    return res.status(503).json({
      error: 'Age verification system temporarily unavailable',
      code: 'VERIFICATION_ERROR',
      message: 'Please try again later'
    });
  }
};

/**
 * Middleware: Check age verification but don't block (soft gate)
 * Just adds verification status to request
 */
export const checkAgeVerification = async (
  req: AgeVerificationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    if (userId) {
      const verification = await ageVerificationEnforcement.checkUserVerification(userId, ipAddress);
      req.ageVerified = verification.verified;
      req.jurisdiction = verification.jurisdiction;
    } else {
      req.ageVerified = false;
    }

    next();
  } catch (error) {
    console.error('[Age Verification Middleware] Soft check error:', error);
    req.ageVerified = false;
    next();
  }
};

/**
 * Middleware: Jurisdiction-specific verification
 * Only enforce for specific jurisdictions
 */
export const requireAgeVerificationFor = (jurisdictions: string[]) => {
  return async (req: AgeVerificationRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get geolocation
      const geolocation = await ageVerificationEnforcement.getGeolocation(ipAddress);

      // Check if user is in specified jurisdiction
      const inTargetJurisdiction = jurisdictions.some(j =>
        geolocation.country === j || `${geolocation.country}-${geolocation.region}` === j
      );

      if (!inTargetJurisdiction) {
        // Not in target jurisdiction, allow access
        return next();
      }

      // In target jurisdiction, require verification
      return requireAgeVerification(req, res, next);

    } catch (error) {
      console.error('[Age Verification Middleware] Jurisdiction check error:', error);
      // Fail closed
      return res.status(503).json({ error: 'Verification system error' });
    }
  };
};

/**
 * Example usage in routes:
 *
 * // Require age verification for all adult content
 * router.get('/adult-content/:id', requireAgeVerification, (req, res) => {
 *   // Serve adult content
 * });
 *
 * // Only require for UK users
 * router.get('/adult-content/:id', requireAgeVerificationFor(['GB']), (req, res) => {
 *   // Serve adult content
 * });
 *
 * // Soft check (doesn't block)
 * router.get('/landing', checkAgeVerification, (req, res) => {
 *   if (req.ageVerified) {
 *     // Show unrestricted content
 *   } else {
 *     // Show age gate
 *   }
 * });
 */
