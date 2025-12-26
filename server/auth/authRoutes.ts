import express from "express";
import passport from "passport";
import { validationResult } from "express-validator";
import {
  MultiAuthService,
  authRateLimit,
  strictAuthRateLimit,
  validateRegistration,
  validateLogin,
  validateFanzId,
  validateTOTP,
  authenticateToken,
} from "./multiAuth";
import { DeviceSecurityService } from "./deviceSecurity";

const router = express.Router();

// Initialize all authentication strategies
MultiAuthService.initializeStrategies();

// Development token endpoint - generates a super admin token for testing
// ONLY available in non-production environments OR with admin secret
// IMPORTANT: This must be defined BEFORE the OAuth /:provider route
router.get("/auth/dev-token", (req, res) => {
  // Security check - allow in development OR with admin secret in production
  const adminSecret = process.env.ADMIN_DEV_SECRET || 'fanz-dev-2025';
  const providedSecret = req.query.secret as string;

  if (process.env.NODE_ENV === 'production' && providedSecret !== adminSecret) {
    return res.status(404).json({ error: 'Not found' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  const devUser = {
    id: 'dev-super-admin',
    email: 'admin@fanz.dev',
    role: 'super_admin',
    clearanceLevel: 10,
    firstName: 'Dev',
    lastName: 'Admin',
  };

  const token = jwt.sign(
    {
      sub: devUser.id,
      userId: devUser.id,
      email: devUser.email,
      role: devUser.role,
      clearanceLevel: devUser.clearanceLevel,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    },
    JWT_SECRET
  );

  res.json({
    success: true,
    token,
    user: devUser,
    message: 'Development token generated. Store in localStorage as "authToken"',
    instructions: 'Run in browser console: localStorage.setItem("authToken", "' + token + '")'
  });
});

// OAuth Routes
router.get("/auth/:provider", authRateLimit, (req, res, next) => {
  const { provider } = req.params;

  if (
    !["google", "github", "facebook", "twitter", "linkedin"].includes(provider)
  ) {
    return res.status(400).json({ error: "Invalid OAuth provider" });
  }

  passport.authenticate(provider, {
    scope: provider === "google" ? ["profile", "email"] : undefined,
  })(req, res, next);
});

router.get("/auth/:provider/callback", authRateLimit, (req, res, next) => {
  const { provider } = req.params;

  passport.authenticate(
    provider,
    { session: false },
    async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=oauth_failed`,
        );
      }

      try {
        // Extract device information
        const deviceInfo = DeviceSecurityService.extractDeviceInfo(req);

        // Analyze login security
        const securityResult = await DeviceSecurityService.analyzeLoginSecurity(
          user.id,
          deviceInfo,
          req,
        );

        if (securityResult.requiresVerification) {
          // Send verification email
          await DeviceSecurityService.sendDeviceVerificationEmail(
            user.email,
            user.firstName || user.username || "User",
            securityResult.verificationToken!,
            deviceInfo,
          );

          return res.redirect(
            `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/device-verification?pending=true`,
          );
        }

        // Generate JWT token
        const token = MultiAuthService.generateJWT(user);

        // Redirect with token
        res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}`,
        );
      } catch (error) {
        console.error("OAuth callback error:", error);
        res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=callback_failed`,
        );
      }
    },
  )(req, res, next);
});

// Local Authentication Routes
router.post(
  "/auth/login",
  strictAuthRateLimit,
  validateLogin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate(
      "local",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ error: "Authentication error" });
        }

        if (!user) {
          return res
            .status(401)
            .json({ error: info?.message || "Invalid credentials" });
        }

        try {
          // Extract device information
          const deviceInfo = DeviceSecurityService.extractDeviceInfo(req);

          // Analyze login security
          const securityResult =
            await DeviceSecurityService.analyzeLoginSecurity(
              user.id,
              deviceInfo,
              req,
            );

          if (securityResult.requiresVerification) {
            // Send verification email
            await DeviceSecurityService.sendDeviceVerificationEmail(
              user.email,
              user.firstName || user.username || "User",
              securityResult.verificationToken!,
              deviceInfo,
            );

            return res.json({
              success: false,
              requiresVerification: true,
              message: "Device verification required. Please check your email.",
              riskScore: securityResult.riskScore,
              reasons: securityResult.reasons,
            });
          }

          // Check if user requires MFA
          const requiresMFA = await MultiAuthService.requiresMFA(user.id);

          if (requiresMFA) {
            // Create temporary session for MFA verification
            const tempToken = MultiAuthService.generateJWT({
              ...user,
              temp: true,
            });
            return res.json({
              success: false,
              requiresMFA: true,
              tempToken,
              message: "Multi-factor authentication required",
            });
          }

          // Generate final JWT token
          const token = MultiAuthService.generateJWT(user);

          res.json({
            success: true,
            user: MultiAuthService.sanitizeUser(user),
            token,
          });
        } catch (error) {
          console.error("Login error:", error);
          res.status(500).json({ error: "Login failed" });
        }
      },
    )(req, res);
  },
);

router.post(
  "/auth/register",
  authRateLimit,
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, username } = req.body;

      const result = await MultiAuthService.registerWithPassword(
        email,
        password,
        firstName,
        lastName,
        username,
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        requiresSetup: result.requiresSetup,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  },
);

// Device Verification
router.post("/auth/verify-device", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token required" });
    }

    const result = await DeviceSecurityService.verifyDeviceToken(token);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Get user and generate token
    const user = await MultiAuthService.getUserById(result.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const authToken = MultiAuthService.generateJWT(user);

    res.json({
      success: true,
      user: MultiAuthService.sanitizeUser(user),
      token: authToken,
      message: "Device verified successfully",
    });
  } catch (error) {
    console.error("Device verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// FanzID Management
router.post(
  "/auth/create-fanz-id",
  authenticateToken,
  validateFanzId,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fanzId } = req.body;
      const userId = req.user.id;

      const result = await MultiAuthService.createFanzId(userId, fanzId);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: "FanzID created successfully",
      });
    } catch (error) {
      console.error("FanzID creation error:", error);
      res.status(500).json({ error: "Failed to create FanzID" });
    }
  },
);

// TOTP/2FA Routes
router.post("/auth/setup-2fa", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await MultiAuthService.setupTOTP(userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      qrCode: result.qrCode,
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
});

router.post(
  "/auth/verify-2fa",
  authenticateToken,
  validateTOTP,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token } = req.body;
      const userId = req.user.id;

      const result = await MultiAuthService.verifyAndEnableTOTP(userId, token);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: "2FA enabled successfully",
      });
    } catch (error) {
      console.error("2FA verification error:", error);
      res.status(500).json({ error: "Failed to verify 2FA" });
    }
  },
);

router.post("/auth/verify-mfa", validateTOTP, async (req, res) => {
  try {
    const { token, tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ error: "Temporary token required" });
    }

    const decoded = MultiAuthService.verifyJWT(tempToken);
    if (!decoded || !decoded.temp) {
      return res.status(401).json({ error: "Invalid temporary token" });
    }

    const isValid = await MultiAuthService.verifyTOTP(decoded.id, token);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Generate final token
    const user = await MultiAuthService.getUserById(decoded.id);
    const finalToken = MultiAuthService.generateJWT(user);

    res.json({
      success: true,
      user: MultiAuthService.sanitizeUser(user),
      token: finalToken,
    });
  } catch (error) {
    console.error("MFA verification error:", error);
    res.status(500).json({ error: "MFA verification failed" });
  }
});

// User Info Route
router.get("/auth/user", authenticateToken, async (req, res) => {
  try {
    const user = await MultiAuthService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: MultiAuthService.sanitizeUser(user),
    });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Security Management Routes
router.get("/auth/trusted-devices", authenticateToken, async (req, res) => {
  try {
    // Implementation would fetch user's trusted devices
    res.json({
      success: true,
      devices: [], // Add actual device fetching logic
    });
  } catch (error) {
    console.error("Trusted devices fetch error:", error);
    res.status(500).json({ error: "Failed to fetch trusted devices" });
  }
});

router.delete(
  "/auth/trusted-device/:fingerprint",
  authenticateToken,
  async (req, res) => {
    try {
      const { fingerprint } = req.params;
      const userId = req.user.id;

      const success = await DeviceSecurityService.removeTrustedDevice(
        userId,
        fingerprint,
      );

      if (!success) {
        return res.status(400).json({ error: "Failed to remove device" });
      }

      res.json({
        success: true,
        message: "Device removed successfully",
      });
    } catch (error) {
      console.error("Device removal error:", error);
      res.status(500).json({ error: "Failed to remove device" });
    }
  },
);

// Logout route
router.post("/auth/logout", authenticateToken, async (req, res) => {
  try {
    // Invalidate session if needed
    // Add token to blacklist if implementing token blacklisting

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
