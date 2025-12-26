# FanzSSO Integration Architecture

**Document Type:** Technical Architecture
**Last Updated:** December 23, 2024
**Version:** 1.0
**Status:** Implementation Required

---

## 🎯 Executive Summary

FanzSSO is the **centralized authentication and identity system** for the entire Fanz ecosystem. It provides:

- ✅ **Single Sign-On (SSO)** - One login across all Fanz platforms
- ✅ **Centralized Age Verification** - Verify once, access all platforms
- ✅ **Unified User Identity** - One user account across ecosystem
- ✅ **Cross-Platform Access** - Seamlessly move between platforms
- ✅ **Security** - OAuth 2.0 / OpenID Connect standards

---

## 🌐 Fanz Ecosystem Platforms

All platforms use FanzSSO for authentication:

1. **BoyFanz** - https://boy.fanz.website
2. **GirlFanz** - https://girl.fanz.website
3. **DaddyFanz** - https://daddy.fanz.website
4. **TransFanz** - https://trans.fanz.website
5. **CougarFanz** - https://cougar.fanz.website
6. **MilfFanz** - https://milf.fanz.website
7. **BearFanz** - https://bear.fanz.website
8. **TabooFanz** - https://taboo.fanz.website
9. **PupFanz** - https://pup.fanz.website
10. **FanzCock** - https://cock.fanz.website
11. **FanzTube** - https://tube.fanz.website
12. **Fanz Dash** - https://dash.fanz.website (Command Center)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FanzSSO (Central)                    │
│              https://sso.fanz.website                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ User         │  │ Age          │  │ Auth         │ │
│  │ Accounts     │  │ Verification │  │ Tokens       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         OAuth 2.0 / OpenID Connect               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  BoyFanz     │    │  GirlFanz    │    │  DaddyFanz   │
│  Database    │    │  Database    │    │  Database    │
│              │    │              │    │              │
│  - Content   │    │  - Content   │    │  - Content   │
│  - Subs      │    │  - Subs      │    │  - Subs      │
│  - Earnings  │    │  - Earnings  │    │  - Earnings  │
└──────────────┘    └──────────────┘    └──────────────┘

         ... (+ 8 more platforms)
```

---

## 🔑 FanzSSO Components

### 1. Central User Database

**Location:** FanzSSO Server
**Database:** `fanz_sso` (PostgreSQL)

**Tables:**
- `users` - Core user accounts
- `age_verification_records` - VerifyMy verification results
- `user_sessions` - Active sessions across all platforms
- `oauth_clients` - Registered Fanz platforms
- `oauth_tokens` - Access/refresh tokens

**Key Fields:**
```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  age_verified BOOLEAN DEFAULT FALSE,
  age_verified_at TIMESTAMP,
  verifymyage_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- age_verification_records table
CREATE TABLE age_verification_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  verification_method VARCHAR(50), -- 'verifymyage', 'id_upload', etc.
  verification_status VARCHAR(50), -- 'verified', 'pending', 'rejected'
  verifymyage_transaction_id VARCHAR(255),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP, -- 7 years from verification
  jurisdiction VARCHAR(100), -- 'UK', 'US-LA', 'EU-DE', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2. OAuth 2.0 / OpenID Connect Flow

**FanzSSO implements standard OAuth 2.0 Authorization Code Flow:**

#### Step 1: User Visits Platform (e.g., BoyFanz)
```
User → https://boy.fanz.website
  ↓
Not authenticated
  ↓
Redirect to FanzSSO
```

#### Step 2: Redirect to FanzSSO
```
https://sso.fanz.website/authorize?
  client_id=boyfanz
  &redirect_uri=https://boy.fanz.website/auth/sso/callback
  &response_type=code
  &scope=openid profile email age_verified
  &state=random_state_token
```

#### Step 3: User Logs In (or Signs Up)
```
User enters email + password at sso.fanz.website
  ↓
FanzSSO verifies credentials
  ↓
Checks if user is age verified
  ↓ (if not verified)
Shows age verification gate
  ↓ (if verified)
Generates authorization code
```

#### Step 4: Callback to Platform
```
FanzSSO redirects back:
https://boy.fanz.website/auth/sso/callback?
  code=AUTHORIZATION_CODE
  &state=random_state_token
```

#### Step 5: Exchange Code for Token
```
BoyFanz backend → FanzSSO token endpoint
POST https://sso.fanz.website/token

Body:
{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "client_id": "boyfanz",
  "client_secret": "BOYFANZ_SECRET",
  "redirect_uri": "https://boy.fanz.website/auth/sso/callback"
}

Response:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "id_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### Step 6: Decode ID Token (JWT)
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "username": "john_doe",
  "age_verified": true,
  "age_verified_at": "2024-12-23T10:00:00Z",
  "age_verified_method": "verifymyage",
  "jurisdiction": "US-LA",
  "iat": 1703334000,
  "exp": 1703337600,
  "iss": "https://sso.fanz.website"
}
```

#### Step 7: Create Local Session
```
BoyFanz creates local session:
- Maps SSO user ID to local user record
- Stores age_verified status
- User now logged in to BoyFanz
```

---

### 3. Age Verification Integration

**Key Concept:** Age verification happens **once** at FanzSSO, valid **everywhere**.

#### First-Time User Flow:

1. **User Signs Up** at any platform (e.g., GirlFanz)
2. **Redirected to FanzSSO** for account creation
3. **FanzSSO detects location** (IP geolocation)
4. **If in required jurisdiction:**
   - Shows age verification gate
   - User verifies through VerifyMy
   - Result stored in `age_verification_records`
   - `users.age_verified = TRUE`
5. **User redirected back** to GirlFanz
6. **Session created** with age_verified status

#### Subsequent Access to Other Platforms:

1. **User visits BoyFanz** (already verified on GirlFanz)
2. **Not logged in to BoyFanz** (no local session)
3. **Redirected to FanzSSO** for authentication
4. **FanzSSO sees user already verified** ✅
5. **ID token includes age_verified: true**
6. **BoyFanz grants access immediately** (no re-verification)

#### Benefits:
- ✅ Verify once, access all platforms
- ✅ No duplicate verification costs
- ✅ Consistent compliance across ecosystem
- ✅ Better user experience

---

### 4. Session Management

**Local Sessions (Per-Platform):**
- Each platform maintains local session after SSO authentication
- Session duration: 30 days (configurable)
- Stored in platform-specific database

**Global Session (FanzSSO):**
- FanzSSO maintains global session
- If user logs out from any platform, can choose:
  - **Platform logout:** Only log out from that platform
  - **Global logout:** Log out from all platforms

**Session Sync:**
```
User logs out from BoyFanz
  ↓
BoyFanz clears local session
  ↓
(Optional) Redirect to FanzSSO global logout
  ↓
FanzSSO invalidates all tokens
  ↓
User logged out from ALL platforms
```

---

## 🗄️ Multi-Platform Database Architecture

### Centralized Tables (FanzSSO Database)

**Stored ONLY in FanzSSO database:**
1. **users** - Core user accounts
2. **age_verification_records** - Age verification results
3. **user_sessions** - Global sessions
4. **oauth_tokens** - Access/refresh tokens

### Platform-Specific Tables

**Each platform has its own database with these tables:**

1. **content_items** - Platform-specific content
2. **subscriptions** - Platform-specific subscriptions
3. **earnings** - Platform-specific creator earnings
4. **messages** - Platform-specific messages
5. **user_platform_profiles** - Platform-specific profile info
6. **payment_transactions** - Platform-specific payments
7. **compliance_logs** - Platform-specific compliance events

**Example: BoyFanz Database**
```
Database: boyfanz_db

Tables:
- content_items (content specific to BoyFanz)
- subscriptions (BoyFanz subscriptions)
- user_platform_profiles (BoyFanz-specific profile data)
- earnings (BoyFanz creator earnings)
- messages (BoyFanz messages)
- payment_transactions (BoyFanz payments)
- compliance_logs (BoyFanz compliance events)

Foreign Key:
- user_id (references FanzSSO users.id)
```

**Example: GirlFanz Database**
```
Database: girlfanz_db

Tables:
- content_items (content specific to GirlFanz)
- subscriptions (GirlFanz subscriptions)
- user_platform_profiles (GirlFanz-specific profile data)
- earnings (GirlFanz creator earnings)
- messages (GirlFanz messages)
- payment_transactions (GirlFanz payments)
- compliance_logs (GirlFanz compliance events)

Foreign Key:
- user_id (references FanzSSO users.id)
```

---

### Database Schema Diagram

```
┌─────────────────────────────────────────┐
│         FanzSSO Database                │
│         (Central/Global)                │
├─────────────────────────────────────────┤
│ ✓ users                                 │
│ ✓ age_verification_records              │
│ ✓ user_sessions                         │
│ ✓ oauth_clients                         │
│ ✓ oauth_tokens                          │
└─────────────────────────────────────────┘
            │ (user_id references)
    ┌───────┴───────┬───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ BoyFanz │   │GirlFanz │   │DaddyFanz│
│   DB    │   │   DB    │   │   DB    │
├─────────┤   ├─────────┤   ├─────────┤
│ content │   │ content │   │ content │
│ subs    │   │ subs    │   │ subs    │
│ earnings│   │ earnings│   │ earnings│
│ messages│   │ messages│   │ messages│
│ profiles│   │ profiles│   │ profiles│
└─────────┘   └─────────┘   └─────────┘
    ... (+ 8 more platform databases)
```

---

### Why This Architecture?

**Centralized (FanzSSO):**
- ✅ Single source of truth for user identity
- ✅ One age verification covers all platforms
- ✅ Consistent authentication across ecosystem
- ✅ Global security policies
- ✅ Easier compliance audits

**Decentralized (Per-Platform):**
- ✅ Platform isolation (BoyFanz content stays on BoyFanz)
- ✅ Independent scaling per platform
- ✅ Platform-specific features without affecting others
- ✅ Easier to add new platforms
- ✅ Better performance (no cross-platform queries)

---

## 🔒 Security Considerations

### 1. Token Security

**Access Tokens:**
- Short-lived (1 hour)
- JWT format (signed by FanzSSO)
- Include user_id, age_verified status
- Validated by each platform using JWKS

**Refresh Tokens:**
- Long-lived (30 days)
- Opaque tokens (not JWT)
- Stored in FanzSSO database
- Used to obtain new access tokens

**Token Validation:**
```typescript
// Platform validates token using FanzSSO JWKS
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://sso.fanz.website/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(accessToken, getKey, {
  issuer: 'https://sso.fanz.website',
  audience: 'boyfanz' // platform-specific
}, (err, decoded) => {
  if (err) {
    // Invalid token
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Token valid, extract user info
  const userId = decoded.sub;
  const ageVerified = decoded.age_verified;

  // Proceed with request
});
```

---

### 2. Cross-Site Request Forgery (CSRF) Protection

**State Parameter:**
- Random state token generated by platform
- Passed to FanzSSO in authorization request
- Validated on callback
- Prevents CSRF attacks

```typescript
// Generate state token
const state = crypto.randomBytes(32).toString('hex');
req.session.oauth_state = state;

// Redirect to FanzSSO with state
res.redirect(`https://sso.fanz.website/authorize?...&state=${state}`);

// Validate state on callback
if (req.query.state !== req.session.oauth_state) {
  return res.status(400).json({ error: 'Invalid state' });
}
```

---

### 3. Age Verification Enforcement

**Middleware for Age-Restricted Content:**

```typescript
export function requireAgeVerification(req: any, res: any, next: any) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user is age verified (from ID token)
  if (!req.user.age_verified) {
    return res.status(403).json({
      error: 'Age verification required',
      verification_url: 'https://sso.fanz.website/verify-age'
    });
  }

  // Age verified, proceed
  next();
}

// Apply to age-restricted routes
app.get('/api/content/nsfw', requireAgeVerification, async (req, res) => {
  // Only age-verified users reach this point
});
```

---

## 🛠️ Implementation Guide

### Step 1: Set Up FanzSSO Server

**Technology Stack:**
- Node.js + Express (or NestJS)
- PostgreSQL (user database)
- OAuth2orize (OAuth 2.0 server)
- jsonwebtoken (JWT signing/verification)

**Environment Variables:**
```bash
# FanzSSO Server (.env)
DATABASE_URL="postgresql://user:pass@host:5432/fanz_sso"
JWT_SECRET="your-jwt-signing-secret-32-chars-minimum"
JWT_EXPIRY="1h"
REFRESH_TOKEN_EXPIRY="30d"

# VerifyMy Integration
VERIFYMYAGE_API_KEY="vma_live_xxxxx"
VERIFYMYAGE_WEBHOOK_SECRET="whsec_xxxxx"

# Geolocation
IPINFO_TOKEN="your_ipinfo_token"

# Registered OAuth Clients (Platforms)
BOYFANZ_CLIENT_ID="boyfanz"
BOYFANZ_CLIENT_SECRET="boyfanz-secret-change-in-production"
BOYFANZ_REDIRECT_URI="https://boy.fanz.website/auth/sso/callback"

GIRLFANZ_CLIENT_ID="girlfanz"
GIRLFANZ_CLIENT_SECRET="girlfanz-secret-change-in-production"
GIRLFANZ_REDIRECT_URI="https://girl.fanz.website/auth/sso/callback"

# ... (repeat for all 11 platforms)
```

---

### Step 2: Register Each Platform as OAuth Client

**In FanzSSO database:**
```sql
INSERT INTO oauth_clients (
  client_id,
  client_secret,
  redirect_uris,
  platform_name,
  platform_url
) VALUES
  ('boyfanz', 'hashed_secret', '["https://boy.fanz.website/auth/sso/callback"]', 'BoyFanz', 'https://boy.fanz.website'),
  ('girlfanz', 'hashed_secret', '["https://girl.fanz.website/auth/sso/callback"]', 'GirlFanz', 'https://girl.fanz.website'),
  ('daddyfanz', 'hashed_secret', '["https://daddy.fanz.website/auth/sso/callback"]', 'DaddyFanz', 'https://daddy.fanz.website'),
  -- ... (repeat for all 11 platforms)
```

---

### Step 3: Implement SSO Client on Each Platform

**Example: BoyFanz Integration**

**Environment Variables:**
```bash
# BoyFanz .env
SSO_ISSUER="https://sso.fanz.website"
SSO_CLIENT_ID="boyfanz"
SSO_CLIENT_SECRET="boyfanz-secret-change-in-production"
SSO_CALLBACK_URL="https://boy.fanz.website/auth/sso/callback"
SSO_JWKS_URL="https://sso.fanz.website/.well-known/jwks.json"
SSO_LOGOUT_URL="https://sso.fanz.website/logout"
```

**Authentication Routes:**
```typescript
// routes/auth.ts
import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Login - Redirect to FanzSSO
router.get('/login', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauth_state = state;

  const authUrl = new URL(`${process.env.SSO_ISSUER}/authorize`);
  authUrl.searchParams.append('client_id', process.env.SSO_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', process.env.SSO_CALLBACK_URL);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile email age_verified');
  authUrl.searchParams.append('state', state);

  res.redirect(authUrl.toString());
});

// Callback - Exchange code for token
router.get('/auth/sso/callback', async (req, res) => {
  const { code, state } = req.query;

  // Validate state (CSRF protection)
  if (state !== req.session.oauth_state) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  try {
    // Exchange code for token
    const tokenResponse = await axios.post(`${process.env.SSO_ISSUER}/token`, {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.SSO_CLIENT_ID,
      client_secret: process.env.SSO_CLIENT_SECRET,
      redirect_uri: process.env.SSO_CALLBACK_URL
    });

    const { access_token, refresh_token, id_token } = tokenResponse.data;

    // Decode ID token (contains user info)
    const decoded = jwt.decode(id_token);

    // Find or create local user record
    let user = await db.users.findOne({ sso_user_id: decoded.sub });
    if (!user) {
      user = await db.users.create({
        sso_user_id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        age_verified: decoded.age_verified
      });
    }

    // Create local session
    req.session.user_id = user.id;
    req.session.sso_user_id = decoded.sub;
    req.session.age_verified = decoded.age_verified;
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    // Redirect to dashboard
    res.redirect('/dashboard');

  } catch (error) {
    console.error('SSO callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();

  // Option 1: Local logout only
  res.redirect('/');

  // Option 2: Global logout (all platforms)
  // res.redirect(`${process.env.SSO_LOGOUT_URL}?redirect_uri=https://boy.fanz.website`);
});

export default router;
```

---

### Step 4: Implement Age Verification Middleware

**Middleware (applies to all age-restricted routes):**
```typescript
// middleware/requireAgeVerification.ts
export function requireAgeVerification(req: any, res: any, next: any) {
  if (!req.session.user_id) {
    // Not authenticated - redirect to login
    return res.redirect('/login');
  }

  if (!req.session.age_verified) {
    // Not age verified - redirect to FanzSSO verification
    return res.redirect(`${process.env.SSO_ISSUER}/verify-age?redirect_uri=${encodeURIComponent(req.originalUrl)}`);
  }

  // Age verified - proceed
  next();
}

// Apply to routes
import { requireAgeVerification } from './middleware/requireAgeVerification';

app.get('/content/nsfw', requireAgeVerification, async (req, res) => {
  // Only age-verified users reach this point
});
```

---

### Step 5: Handle Token Refresh

**Refresh expired access tokens:**
```typescript
// middleware/refreshToken.ts
export async function refreshTokenIfNeeded(req: any, res: any, next: any) {
  if (!req.session.access_token) {
    return next();
  }

  // Decode token to check expiry
  const decoded = jwt.decode(req.session.access_token);
  const now = Math.floor(Date.now() / 1000);

  // If token expires in < 5 minutes, refresh it
  if (decoded.exp - now < 300) {
    try {
      const tokenResponse = await axios.post(`${process.env.SSO_ISSUER}/token`, {
        grant_type: 'refresh_token',
        refresh_token: req.session.refresh_token,
        client_id: process.env.SSO_CLIENT_ID,
        client_secret: process.env.SSO_CLIENT_SECRET
      });

      req.session.access_token = tokenResponse.data.access_token;
      req.session.refresh_token = tokenResponse.data.refresh_token;

    } catch (error) {
      // Refresh failed - user needs to re-authenticate
      req.session.destroy();
      return res.redirect('/login');
    }
  }

  next();
}

// Apply globally
app.use(refreshTokenIfNeeded);
```

---

## 📊 Migration Strategy

### Phase 1: Set Up FanzSSO (Week 1-2)
- [ ] Deploy FanzSSO server
- [ ] Set up central database
- [ ] Implement OAuth 2.0 endpoints
- [ ] Integrate VerifyMy for age verification
- [ ] Register all 11 platforms as OAuth clients

### Phase 2: Integrate Fanz Dash (Week 3)
- [ ] Update Fanz Dash to use FanzSSO
- [ ] Test authentication flow
- [ ] Test age verification
- [ ] Verify local session management

### Phase 3: Integrate Remaining Platforms (Week 4-6)
- [ ] BoyFanz integration
- [ ] GirlFanz integration
- [ ] DaddyFanz integration
- [ ] TransFanz integration
- [ ] CougarFanz integration
- [ ] MilfFanz integration
- [ ] BearFanz integration
- [ ] TabooFanz integration
- [ ] PupFanz integration
- [ ] FanzCock integration
- [ ] FanzTube integration

### Phase 4: Database Migration (Week 7-8)
- [ ] Separate content tables per platform
- [ ] Migrate existing users to FanzSSO
- [ ] Migrate age verification records to FanzSSO
- [ ] Update foreign key references

### Phase 5: Testing & Launch (Week 9-10)
- [ ] Cross-platform testing
- [ ] Age verification flow testing
- [ ] Token refresh testing
- [ ] Logout (local vs global) testing
- [ ] Performance testing
- [ ] Security audit

---

## ✅ Verification Checklist

**FanzSSO Server:**
- [ ] OAuth 2.0 authorization endpoint working
- [ ] Token endpoint working
- [ ] JWKS endpoint published
- [ ] Age verification integrated
- [ ] All 11 platforms registered as clients

**Each Platform:**
- [ ] SSO login flow working
- [ ] Callback handling working
- [ ] Token validation working
- [ ] Token refresh working
- [ ] Age verification middleware applied
- [ ] Logout (local and global) working

**Cross-Platform:**
- [ ] User can log in to Platform A
- [ ] User can then access Platform B without re-login
- [ ] User verified on Platform A can access age-restricted content on Platform B
- [ ] User logout from Platform A doesn't affect Platform B (local logout)
- [ ] User global logout logs out from all platforms

---

## 📞 Support

**Technical Questions:**
- Email: sso-support@fanz.com
- Slack: #fanz-sso-support

**Security Concerns:**
- Email: security@fanz.com
- PGP Key: [Link to PGP key]

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Infrastructure Team
**Next Review:** January 2025
