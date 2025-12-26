# Multi-Platform Database Architecture

**Document Type:** Database Architecture
**Last Updated:** December 23, 2024
**Version:** 1.0
**Status:** Implementation Required

---

## 🎯 Executive Summary

The Fanz ecosystem uses a **hybrid database architecture**:

- **Centralized:** User accounts, age verification, authentication (FanzSSO database)
- **Decentralized:** Platform-specific content, subscriptions, messages, earnings (per-platform databases)

This architecture enables:
- ✅ **Single sign-on** across all platforms
- ✅ **Verify once, access everywhere** for age verification
- ✅ **Platform isolation** for content and transactions
- ✅ **Independent scaling** per platform
- ✅ **Easy addition** of new platforms

---

## 🗄️ Database Structure Overview

```
┌──────────────────────────────────────────────────────┐
│              CENTRAL DATABASE                         │
│         fanz_sso (PostgreSQL)                        │
│         Host: db.sso.fanz.website                    │
├──────────────────────────────────────────────────────┤
│ CENTRALIZED TABLES (Shared Across All Platforms):   │
│ • users                                              │
│ • age_verification_records                          │
│ • user_sessions                                      │
│ • oauth_clients                                      │
│ • oauth_tokens                                       │
│ • kyc_verifications                                  │
│ • form_2257_records (centralized)                   │
│ • gdpr_data_subject_requests                        │
│ • audit_logs (cross-platform)                       │
└──────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  boyfanz_db │  │girlfanz_db  │  │daddyfanz_db │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ PLATFORM-   │  │ PLATFORM-   │  │ PLATFORM-   │
│ SPECIFIC:   │  │ SPECIFIC:   │  │ SPECIFIC:   │
│             │  │             │  │             │
│ • content   │  │ • content   │  │ • content   │
│ • subs      │  │ • subs      │  │ • subs      │
│ • messages  │  │ • messages  │  │ • messages  │
│ • earnings  │  │ • earnings  │  │ • earnings  │
│ • profiles  │  │ • profiles  │  │ • profiles  │
│ • payments  │  │ • payments  │  │ • payments  │
│ • compliance│  │ • compliance│  │ • compliance│
└─────────────┘  └─────────────┘  └─────────────┘

     ... (+8 more platform databases)
```

---

## 🏗️ Centralized Tables (FanzSSO Database)

### Database: `fanz_sso`
**Host:** `db.sso.fanz.website`
**Purpose:** Centralized user identity, authentication, age verification

### Tables

#### 1. `users` - Core User Accounts
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Age Verification Status
  age_verified BOOLEAN DEFAULT FALSE,
  age_verified_at TIMESTAMP,
  age_verification_method VARCHAR(50), -- 'verifymyage', 'id_upload', 'credit_card', 'ai_estimation'
  age_verification_expires_at TIMESTAMP, -- 7 years from verification
  verifymyage_transaction_id VARCHAR(255),

  -- User Info
  date_of_birth DATE, -- Stored only if uploaded ID
  full_name VARCHAR(255), -- Stored only if uploaded ID

  -- Account Status
  account_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'banned'
  banned_reason TEXT,
  banned_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  last_login_ip INET,

  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_age_verified ON users(age_verified);
```

---

#### 2. `age_verification_records` - Age Verification History
```sql
CREATE TABLE age_verification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Verification Details
  verification_method VARCHAR(50) NOT NULL, -- 'verifymyage', 'id_upload', 'credit_card', 'ai_estimation'
  verification_status VARCHAR(50) NOT NULL, -- 'verified', 'pending', 'rejected', 'expired'

  -- VerifyMy Integration
  verifymyage_transaction_id VARCHAR(255),
  verifymyage_session_id VARCHAR(255),
  verifymyage_webhook_received_at TIMESTAMP,

  -- ID Upload Method
  id_document_type VARCHAR(50), -- 'drivers_license', 'passport', 'national_id', 'state_id'
  id_document_number_partial VARCHAR(50), -- Last 4 digits only (XXX-XX-1234)
  id_document_expiry DATE,
  id_front_image_url TEXT, -- Encrypted S3 URL
  id_back_image_url TEXT, -- Encrypted S3 URL
  selfie_with_id_url TEXT, -- Encrypted S3 URL

  -- Credit Card Method
  card_last_four VARCHAR(4),
  card_type VARCHAR(20), -- 'visa', 'mastercard', 'amex', 'discover'
  card_expiry_month INT,
  card_expiry_year INT,

  -- AI Estimation Method
  ai_estimated_age_range VARCHAR(20), -- '25-30', '30-35', etc.
  ai_confidence_score DECIMAL(5,2), -- 0.00 to 1.00
  ai_face_image_url TEXT, -- Encrypted S3 URL

  -- Jurisdiction
  jurisdiction VARCHAR(100) NOT NULL, -- 'UK', 'US-LA', 'US-UT', 'EU-DE', etc.
  ip_address INET,
  country_code VARCHAR(2),
  state_code VARCHAR(10),

  -- Verification Dates
  verified_at TIMESTAMP,
  expires_at TIMESTAMP, -- 7 years from verification (2257 requirement)

  -- Reviewer (for manual reviews)
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT age_verification_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_age_verification_records_user_id ON age_verification_records(user_id);
CREATE INDEX idx_age_verification_records_status ON age_verification_records(verification_status);
CREATE INDEX idx_age_verification_records_expires_at ON age_verification_records(expires_at);
```

---

#### 3. `user_sessions` - Global Sessions
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Session Info
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,

  -- Session Metadata
  ip_address INET,
  user_agent TEXT,
  platform VARCHAR(50), -- 'boyfanz', 'girlfanz', 'dash', etc.

  -- Session Dates
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT NOW(),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP,
  revoked_reason VARCHAR(255)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
```

---

#### 4. `oauth_clients` - Registered Platforms
```sql
CREATE TABLE oauth_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Client Credentials
  client_id VARCHAR(100) UNIQUE NOT NULL, -- 'boyfanz', 'girlfanz', etc.
  client_secret_hash VARCHAR(255) NOT NULL,

  -- Platform Info
  platform_name VARCHAR(100) NOT NULL, -- 'BoyFanz', 'GirlFanz', etc.
  platform_url VARCHAR(255) NOT NULL, -- 'https://boy.fanz.website'
  redirect_uris JSONB NOT NULL, -- ["https://boy.fanz.website/auth/sso/callback"]

  -- OAuth Settings
  allowed_scopes JSONB DEFAULT '["openid", "profile", "email", "age_verified"]',
  token_expiry_seconds INT DEFAULT 3600, -- 1 hour
  refresh_token_expiry_seconds INT DEFAULT 2592000, -- 30 days

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
```

---

#### 5. `oauth_tokens` - Access/Refresh Tokens
```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id VARCHAR(100) REFERENCES oauth_clients(client_id),

  -- Tokens
  access_token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500) UNIQUE,

  -- Token Metadata
  token_type VARCHAR(20) DEFAULT 'Bearer',
  scope VARCHAR(255), -- 'openid profile email age_verified'

  -- Expiry
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP,

  -- Status
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX idx_oauth_tokens_refresh_token ON oauth_tokens(refresh_token);
```

---

#### 6. `kyc_verifications` - KYC/Identity Verification
```sql
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- KYC Provider
  provider VARCHAR(50), -- 'jumio', 'onfido', 'stripe_identity'
  provider_transaction_id VARCHAR(255),

  -- Verification Status
  verification_status VARCHAR(50), -- 'pending', 'approved', 'rejected', 'expired'
  verification_type VARCHAR(50), -- 'document', 'selfie', 'liveness'

  -- Identity Information
  full_name VARCHAR(255),
  date_of_birth DATE,
  nationality VARCHAR(2),
  document_type VARCHAR(50),
  document_number_partial VARCHAR(50), -- Partially redacted

  -- Verification Dates
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Reviewer Notes
  rejection_reason TEXT,
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
```

---

#### 7. `form_2257_records` - Centralized 2257 Records
```sql
CREATE TABLE form_2257_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Performer Info
  performer_user_id UUID REFERENCES users(id), -- If performer has Fanz account
  legal_name VARCHAR(255) NOT NULL,
  stage_names JSONB, -- ["stage_name_1", "stage_name_2"]
  date_of_birth DATE NOT NULL,

  -- ID Document
  id_type VARCHAR(50) NOT NULL, -- 'drivers_license', 'passport', etc.
  id_number_partial VARCHAR(50), -- XXX-XX-1234
  id_issued_date DATE,
  id_expiry_date DATE,
  id_issuing_authority VARCHAR(255),

  -- Document Storage (Encrypted)
  id_front_image_url TEXT NOT NULL,
  id_back_image_url TEXT,
  model_release_form_url TEXT,

  -- Production Details
  producer_user_id UUID REFERENCES users(id), -- Creator who produced content
  production_date DATE NOT NULL,
  content_description TEXT,

  -- Content References (cross-platform)
  content_urls JSONB, -- [{"platform": "boyfanz", "url": "..."}]

  -- Compliance
  record_retention_expires_at TIMESTAMP, -- 7 years from last content publication
  last_content_published_at TIMESTAMP,

  -- Custodian of Records
  custodian_name VARCHAR(255) DEFAULT 'Fanz Legal Compliance',
  custodian_address TEXT DEFAULT '123 Compliance Street, Legal City, ST 12345',

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT form_2257_records_age_check CHECK (
    date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
  )
);

CREATE INDEX idx_form_2257_records_performer_user_id ON form_2257_records(performer_user_id);
CREATE INDEX idx_form_2257_records_producer_user_id ON form_2257_records(producer_user_id);
CREATE INDEX idx_form_2257_records_expires_at ON form_2257_records(record_retention_expires_at);
```

---

#### 8. `gdpr_data_subject_requests` - Centralized GDPR Requests
```sql
CREATE TABLE gdpr_data_subject_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Request Details
  request_type VARCHAR(50) NOT NULL, -- 'access', 'erasure', 'rectification', 'portability', etc.
  request_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'

  -- Requester Info (in case user deleted)
  requester_email VARCHAR(255) NOT NULL,
  requester_name VARCHAR(255),

  -- Request Specifics
  request_details TEXT,
  requested_data_categories JSONB, -- ['profile', 'content', 'messages', 'payments']

  -- Processing
  assigned_to UUID REFERENCES users(id), -- Compliance officer
  processing_notes TEXT,
  rejection_reason TEXT,

  -- Deadlines (GDPR: 30 days)
  deadline_at TIMESTAMP NOT NULL, -- submitted_at + 30 days
  completed_at TIMESTAMP,

  -- Data Export (for access/portability requests)
  export_file_url TEXT, -- S3 URL for data export
  export_generated_at TIMESTAMP,

  -- Cross-Platform
  platforms_affected JSONB, -- ['boyfanz', 'girlfanz', 'dash']

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gdpr_requests_user_id ON gdpr_data_subject_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_data_subject_requests(request_status);
CREATE INDEX idx_gdpr_requests_deadline ON gdpr_data_subject_requests(deadline_at);
```

---

## 🎨 Platform-Specific Tables

Each platform has its **own database** with the following tables. User identity is linked via `user_id` (foreign key to `fanz_sso.users.id`).

### Example: BoyFanz Database (`boyfanz_db`)

**Host:** `db.boy.fanz.website`

---

#### 1. `content_items` - Platform Content
```sql
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to centralized user
  user_id UUID NOT NULL, -- References fanz_sso.users.id

  -- Content Details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_type VARCHAR(50), -- 'image', 'video', 'audio', 'text'

  -- Media URLs
  media_url TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Content Metadata
  duration_seconds INT, -- For videos/audio
  file_size_bytes BIGINT,
  dimensions VARCHAR(20), -- '1920x1080'

  -- Visibility
  visibility VARCHAR(50) DEFAULT 'subscribers', -- 'public', 'subscribers', 'ppv', 'private'
  ppv_price DECIMAL(10,2), -- Pay-per-view price

  -- Content Status
  status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published', 'archived', 'removed'
  removed_reason TEXT,
  removed_at TIMESTAMP,

  -- Compliance (platform-specific checks)
  compliance_risk_score INT, -- 0-100
  compliance_flagged BOOLEAN DEFAULT FALSE,
  compliance_reviewed BOOLEAN DEFAULT FALSE,
  compliance_reviewed_by UUID, -- References fanz_sso.users.id
  compliance_reviewed_at TIMESTAMP,

  -- Statistics
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX idx_content_items_user_id ON content_items(user_id);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_published_at ON content_items(published_at);
```

---

#### 2. `subscriptions` - Platform Subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Subscriber and Creator (both reference fanz_sso.users.id)
  subscriber_id UUID NOT NULL, -- References fanz_sso.users.id
  creator_id UUID NOT NULL, -- References fanz_sso.users.id

  -- Subscription Details
  subscription_tier VARCHAR(50), -- 'free', 'basic', 'premium', 'vip'
  subscription_price DECIMAL(10,2),
  billing_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'annual'

  -- Subscription Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'expired', 'suspended'

  -- Billing Dates
  started_at TIMESTAMP DEFAULT NOW(),
  current_period_start TIMESTAMP DEFAULT NOW(),
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Payment
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  failed_payment_count INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator_id ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

#### 3. `earnings` - Creator Earnings
```sql
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Creator (references fanz_sso.users.id)
  creator_id UUID NOT NULL, -- References fanz_sso.users.id

  -- Earning Details
  earning_type VARCHAR(50), -- 'subscription', 'tip', 'ppv', 'custom_request', 'private_show'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Platform Fee
  platform_fee_percentage DECIMAL(5,2), -- 20.00 = 20%
  platform_fee_amount DECIMAL(10,2),
  net_amount DECIMAL(10,2), -- amount - platform_fee_amount

  -- Related Records
  subscription_id UUID REFERENCES subscriptions(id),
  content_id UUID REFERENCES content_items(id),
  transaction_id UUID, -- References payment_transactions.id

  -- Payer (subscriber/fan)
  payer_id UUID, -- References fanz_sso.users.id

  -- Payout Status
  payout_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'held'
  payout_id UUID, -- References payouts.id
  paid_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_earnings_creator_id ON earnings(creator_id);
CREATE INDEX idx_earnings_payout_status ON earnings(payout_status);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);
```

---

#### 4. `messages` - Platform Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Sender and Recipient (both reference fanz_sso.users.id)
  sender_id UUID NOT NULL, -- References fanz_sso.users.id
  recipient_id UUID NOT NULL, -- References fanz_sso.users.id

  -- Message Content
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'tip'
  message_text TEXT,
  media_url TEXT,

  -- Paid Message (PPV)
  is_paid_message BOOLEAN DEFAULT FALSE,
  message_price DECIMAL(10,2),
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP,

  -- Message Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_deleted_by_sender BOOLEAN DEFAULT FALSE,
  is_deleted_by_recipient BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

#### 5. `user_platform_profiles` - Platform-Specific Profile Data
```sql
CREATE TABLE user_platform_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to centralized user
  user_id UUID UNIQUE NOT NULL, -- References fanz_sso.users.id (one profile per user per platform)

  -- Platform-Specific Profile
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,

  -- Creator Settings (if user is a creator on this platform)
  is_creator BOOLEAN DEFAULT FALSE,
  creator_verified BOOLEAN DEFAULT FALSE,
  subscription_price DECIMAL(10,2), -- Default subscription price

  -- Social Links
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),

  -- Privacy Settings
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_messages_from VARCHAR(50) DEFAULT 'subscribers', -- 'everyone', 'subscribers', 'no_one'

  -- Statistics (platform-specific)
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  content_count INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_platform_profiles_user_id ON user_platform_profiles(user_id);
CREATE INDEX idx_user_platform_profiles_is_creator ON user_platform_profiles(is_creator);
```

---

#### 6. `payment_transactions` - Platform Payment Transactions
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Payer and Payee (both reference fanz_sso.users.id)
  payer_id UUID NOT NULL, -- References fanz_sso.users.id
  payee_id UUID NOT NULL, -- References fanz_sso.users.id (creator)

  -- Transaction Details
  transaction_type VARCHAR(50), -- 'subscription', 'tip', 'ppv', 'custom_request'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment Processor
  processor VARCHAR(50), -- 'ccbill', 'segpay', 'crypto', etc.
  processor_transaction_id VARCHAR(255),

  -- Transaction Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'

  -- Related Records
  subscription_id UUID REFERENCES subscriptions(id),
  content_id UUID REFERENCES content_items(id),
  message_id UUID REFERENCES messages(id),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_payer_id ON payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_payee_id ON payment_transactions(payee_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
```

---

#### 7. `compliance_logs` - Platform-Specific Compliance Events
```sql
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User and Content
  user_id UUID, -- References fanz_sso.users.id
  content_id UUID REFERENCES content_items(id),

  -- Compliance Event
  event_type VARCHAR(100), -- 'csam_scan', 'payment_processor_review', 'trafficking_assessment'
  event_status VARCHAR(50), -- 'passed', 'flagged', 'blocked', 'reported'

  -- Event Details
  risk_score INT, -- 0-100
  flagged_categories JSONB, -- ['incest', 'non_consent']
  automated_action VARCHAR(50), -- 'allowed', 'blocked', 'held_for_review'

  -- Reviewer (if manual review)
  reviewed_by UUID, -- References fanz_sso.users.id
  review_notes TEXT,
  review_decision VARCHAR(50), -- 'approved', 'rejected'
  reviewed_at TIMESTAMP,

  -- External Reporting (e.g., NCMEC)
  external_report_sent BOOLEAN DEFAULT FALSE,
  external_report_id VARCHAR(255),
  external_report_sent_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compliance_logs_user_id ON compliance_logs(user_id);
CREATE INDEX idx_compliance_logs_content_id ON compliance_logs(content_id);
CREATE INDEX idx_compliance_logs_event_type ON compliance_logs(event_type);
```

---

## 🔄 Cross-Platform Data Flow

### User Registration Flow

```
1. User visits GirlFanz → Clicks "Sign Up"
   ↓
2. Redirected to FanzSSO: https://sso.fanz.website/signup
   ↓
3. User enters email + password at FanzSSO
   ↓
4. FanzSSO creates record in fanz_sso.users table
   user_id = UUID (e.g., "123e4567-e89b-12d3-a456-426614174000")
   ↓
5. FanzSSO detects location (IP geolocation)
   Location: Louisiana, USA → Age verification required
   ↓
6. FanzSSO shows age verification gate
   ↓
7. User verifies via VerifyMy
   ↓
8. FanzSSO stores in fanz_sso.age_verification_records
   user_id = "123e4567-e89b-12d3-a456-426614174000"
   verification_status = "verified"
   ↓
9. FanzSSO updates fanz_sso.users
   age_verified = TRUE
   ↓
10. User redirected back to GirlFanz with OAuth code
   ↓
11. GirlFanz exchanges code for tokens
   ID token contains: user_id, email, username, age_verified=true
   ↓
12. GirlFanz creates local profile in girlfanz_db.user_platform_profiles
   user_id = "123e4567-e89b-12d3-a456-426614174000" (same as FanzSSO)
   display_name = "JaneDoe"
   ↓
13. User now registered and logged in to GirlFanz
```

---

### Cross-Platform Access Flow

```
SCENARIO: User verified on GirlFanz, now visits BoyFanz for first time

1. User visits BoyFanz → Not logged in locally
   ↓
2. BoyFanz redirects to FanzSSO for authentication
   ↓
3. FanzSSO recognizes user (has valid session cookie)
   FanzSSO checks: user_id "123e4567-e89b-12d3-a456-426614174000" exists
   age_verified = TRUE ✅
   ↓
4. FanzSSO generates authorization code (user doesn't re-login)
   ↓
5. BoyFanz exchanges code for tokens
   ID token contains: user_id, email, username, age_verified=true
   ↓
6. BoyFanz checks boyfanz_db.user_platform_profiles
   No profile found for user_id "123e4567-e89b-12d3-a456-426614174000"
   ↓
7. BoyFanz creates new profile in boyfanz_db.user_platform_profiles
   user_id = "123e4567-e89b-12d3-a456-426614174000" (same as FanzSSO and GirlFanz)
   display_name = "JaneDoe" (can be different per platform if desired)
   ↓
8. User now logged in to BoyFanz, no re-verification needed ✅
```

**Key Insight:** Same `user_id` across all platforms, but separate profiles per platform.

---

### Content Creator 2257 Compliance Flow

```
SCENARIO: Creator on BoyFanz uploads collab content with another performer

1. Creator uploads video to BoyFanz with performer "John Doe"
   ↓
2. BoyFanz prompts: "Upload ID verification for all performers"
   ↓
3. Creator uploads:
   - John Doe's driver's license (front/back)
   - Model release form signed by John Doe
   ↓
4. BoyFanz stores temporarily in boyfanz_db
   ↓
5. BoyFanz calls FanzSSO API to store centralized 2257 record
   POST https://sso.fanz.website/api/2257/records
   ↓
6. FanzSSO creates record in fanz_sso.form_2257_records
   performer_name = "John Doe"
   producer_user_id = "123e4567..." (BoyFanz creator's user_id)
   content_urls = [{"platform": "boyfanz", "url": "https://boy.fanz.website/content/xyz"}]
   ↓
7. Record stored centrally, available for FBI inspection
   ↓
8. If same creator uploads content with John Doe on GirlFanz:
   - Can reference existing fanz_sso.form_2257_records record
   - Just add new URL to content_urls array
   - No need to re-upload ID documents ✅
```

---

### GDPR Data Erasure Request Flow

```
SCENARIO: EU user requests account deletion

1. User submits "Right to Erasure" request via any platform (e.g., DaddyFanz)
   ↓
2. DaddyFanz calls FanzSSO API
   POST https://sso.fanz.website/api/gdpr/requests
   ↓
3. FanzSSO creates record in fanz_sso.gdpr_data_subject_requests
   user_id = "123e4567..."
   request_type = "erasure"
   platforms_affected = ["boyfanz", "girlfanz", "daddyfanz"]
   deadline_at = NOW() + 30 days
   ↓
4. FanzSSO notifies all platforms via webhook
   POST https://boy.fanz.website/api/gdpr/webhook
   POST https://girl.fanz.website/api/gdpr/webhook
   POST https://daddy.fanz.website/api/gdpr/webhook
   ↓
5. Each platform deletes user data:
   - BoyFanz deletes from boyfanz_db.user_platform_profiles
   - BoyFanz deletes from boyfanz_db.content_items (user's content)
   - BoyFanz deletes from boyfanz_db.messages
   - (Repeat for GirlFanz, DaddyFanz)
   ↓
6. FanzSSO deletes central data (with exceptions):
   ✅ Deleted: fanz_sso.users.email, username, password
   ❌ KEPT (legal requirement): fanz_sso.age_verification_records (7 years)
   ❌ KEPT (legal requirement): fanz_sso.form_2257_records (7 years)
   ↓
7. FanzSSO marks request as completed
   gdpr_data_subject_requests.status = "completed"
   ↓
8. User receives confirmation email
```

---

## 📊 Database Hosting Strategy

### Option 1: Separate PostgreSQL Instances (Recommended for Large Scale)

```
- sso.fanz.website:
  - Database: fanz_sso
  - Host: db.sso.fanz.website (dedicated server)

- boy.fanz.website:
  - Database: boyfanz_db
  - Host: db.boy.fanz.website (dedicated server)

- girl.fanz.website:
  - Database: girlfanz_db
  - Host: db.girl.fanz.website (dedicated server)

... (repeat for each platform)
```

**Pros:**
- ✅ Complete isolation
- ✅ Independent scaling
- ✅ Fault isolation (one platform DB down doesn't affect others)
- ✅ Easier to add new platforms

**Cons:**
- ❌ Higher cost (12 separate DB servers)
- ❌ More complex to maintain

---

### Option 2: Single PostgreSQL Instance with Multiple Databases

```
- db.fanz.website (single PostgreSQL server)
  - Database: fanz_sso
  - Database: boyfanz_db
  - Database: girlfanz_db
  - Database: daddyfanz_db
  - ... (11 total platform databases)
```

**Pros:**
- ✅ Lower cost (1 server)
- ✅ Easier backups (one server to backup)
- ✅ Simpler management

**Cons:**
- ❌ Single point of failure
- ❌ Scaling limited to vertical scaling
- ❌ No fault isolation

---

### Option 3: Hybrid (Recommended for Medium Scale)

```
- db.sso.fanz.website:
  - fanz_sso (centralized, high-importance)

- db.platforms.fanz.website:
  - boyfanz_db
  - girlfanz_db
  - daddyfanz_db
  - ... (all 11 platform databases)
```

**Pros:**
- ✅ Central authentication isolated (high availability)
- ✅ Cost-effective for platform databases
- ✅ Easier to scale (split platform DBs later if needed)

**Cons:**
- ❌ Platform databases share resources

---

## 🔄 Migration Scripts

### Step 1: Create FanzSSO Central Database

```sql
-- Run on db.sso.fanz.website
CREATE DATABASE fanz_sso;

\c fanz_sso;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all central tables (users, age_verification_records, etc.)
-- (Full SQL provided in sections above)
```

---

### Step 2: Migrate Existing Users to FanzSSO

```typescript
// Migration script: migrate-users-to-sso.ts

import { db as dashDb } from './server/db'; // Fanz Dash DB
import { db as ssoDb } from './sso/db'; // FanzSSO DB

async function migrateUsersToSSO() {
  console.log('Starting user migration to FanzSSO...');

  // Get all users from Fanz Dash
  const dashUsers = await dashDb.query.users.findMany();

  for (const dashUser of dashUsers) {
    // Check if user already exists in SSO
    const existingSSOUser = await ssoDb.query.users.findFirst({
      where: eq(users.email, dashUser.email)
    });

    if (existingSSOUser) {
      console.log(`User ${dashUser.email} already exists in SSO, skipping`);
      continue;
    }

    // Create user in FanzSSO
    const [ssoUser] = await ssoDb.insert(users).values({
      id: dashUser.id, // Keep same ID for continuity
      email: dashUser.email,
      username: dashUser.username,
      password_hash: dashUser.password,
      age_verified: dashUser.age_verified || false,
      age_verified_at: dashUser.age_verified_at,
      created_at: dashUser.created_at,
      updated_at: dashUser.updated_at
    }).returning();

    console.log(`Migrated user ${dashUser.email} to SSO (ID: ${ssoUser.id})`);

    // Migrate age verification records if exist
    const ageVerificationRecords = await dashDb.query.age_verification_records.findMany({
      where: eq(age_verification_records.user_id, dashUser.id)
    });

    for (const record of ageVerificationRecords) {
      await ssoDb.insert(age_verification_records).values({
        ...record,
        user_id: ssoUser.id // Reference SSO user ID
      });
    }

    console.log(`Migrated ${ageVerificationRecords.length} age verification records`);
  }

  console.log('Migration complete!');
}

migrateUsersToSSO();
```

---

### Step 3: Create Platform Databases

```bash
#!/bin/bash
# create-platform-databases.sh

PLATFORMS=("boyfanz" "girlfanz" "daddyfanz" "transfanz" "cougarfanz" "milffanz" "bearfanz" "taboofanz" "pupfanz" "fanzcock" "fanztube")

for platform in "${PLATFORMS[@]}"; do
  echo "Creating database: ${platform}_db"

  psql -U postgres -h db.platforms.fanz.website << EOF
    CREATE DATABASE ${platform}_db;
    \c ${platform}_db;

    -- Enable extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Create platform-specific tables
    -- (SQL for content_items, subscriptions, earnings, etc.)
EOF

  echo "Database ${platform}_db created!"
done
```

---

## ✅ Implementation Checklist

### Phase 1: FanzSSO Setup
- [ ] Create `fanz_sso` database
- [ ] Create all centralized tables
- [ ] Implement OAuth 2.0 authorization server
- [ ] Integrate VerifyMy for age verification
- [ ] Set up JWKS endpoint for token validation
- [ ] Register all 11 platforms as OAuth clients

### Phase 2: Migrate Existing Data
- [ ] Migrate users from Fanz Dash to FanzSSO
- [ ] Migrate age verification records to FanzSSO
- [ ] Migrate 2257 records to FanzSSO (if any exist)
- [ ] Migrate GDPR requests to FanzSSO (if any exist)

### Phase 3: Create Platform Databases
- [ ] Create 11 platform databases
- [ ] Create platform-specific tables in each database
- [ ] Set up foreign key references to FanzSSO (user_id)

### Phase 4: Update Platform Code
- [ ] Update each platform to use FanzSSO for authentication
- [ ] Update database queries to use platform-specific database
- [ ] Update age verification middleware to check FanzSSO
- [ ] Update 2257 compliance to store centrally in FanzSSO

### Phase 5: Testing
- [ ] Test single sign-on across all platforms
- [ ] Test age verification (verify once, access all platforms)
- [ ] Test cross-platform data isolation
- [ ] Test GDPR erasure requests (cross-platform deletion)
- [ ] Test 2257 record storage and retrieval

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Infrastructure Team
**Next Review:** January 2025
