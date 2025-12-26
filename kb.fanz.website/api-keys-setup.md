# API Keys Setup Guide - KB.fanz.website

**Category:** Getting Started > Compliance Setup
**Last Updated:** December 2024
**Applies to:** Fanz Dash, All Platforms
**Legal Requirement:** Yes - Some keys required by law

---

## Overview

Fanz Dash requires specific API keys to operate legally and securely. This guide explains what keys you need, where to get them, and how to configure them.

## ⚠️ Legal Warning

Some API keys are **required by federal and international law**. Operating without them can result in:
- Federal criminal charges (10-20 years imprisonment)
- Multi-million dollar fines
- Platform shutdown
- Payment processor termination

---

## 🔑 Required API Keys

### 1. Database (CRITICAL - Cannot operate without this)

**Key:** `DATABASE_URL`
**Cost:** Varies by provider
**Setup Time:** 10 minutes
**Legal Requirement:** No, but system won't start without it

**What it does:**
- Stores all user data, content, compliance records
- Required for the platform to function

**Where to get it:**
1. Sign up for PostgreSQL database:
   - **Neon.tech** (Recommended) - Free tier available
   - **Supabase** - Free tier available
   - **AWS RDS** - Production-ready
   - **Self-hosted PostgreSQL**

2. Get your connection string:
   ```
   postgresql://username:password@host:5432/database_name
   ```

3. Add to `.env`:
   ```bash
   DATABASE_URL="postgresql://username:password@host:5432/fanz_core"
   ```

**Testing:**
```bash
npm run db:push  # Should succeed if configured correctly
```

---

### 2. Age Verification (REQUIRED BY LAW)

**Key:** `VERIFYMYAGE_API_KEY`
**Cost:** $0.50-1.50 per verification
**Setup Time:** 15 minutes
**Legal Requirement:** YES

**Required by:**
- UK Online Safety Act 2023 (£18M penalty)
- 8 US State Laws ($5K+ per violation)
- EU member state regulations

**What it does:**
- Verifies users are 18+ before accessing adult content
- Required in UK, US states (LA, UT, VA, TX, AR, MS, MT, KS), EU

**Where to get it:**
1. Go to [https://verifymyage.com](https://verifymyage.com)
2. Click "Sign Up" → Select "Business Account"
3. Complete business verification (2-3 days)
4. Go to Dashboard → API Settings
5. Copy your API key

**Setup:**
```bash
# Add to .env
VERIFYMYAGE_API_KEY="vma_live_xxxxxxxxxxxxx"
VERIFYMYAGE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

**Configure Webhook:**
1. In VerifyMy dashboard, go to Webhooks
2. Add webhook URL: `https://yourdomain.com/api/compliance/age-verification/callback`
3. Copy webhook secret to `.env`

**Testing:**
```bash
# Test verification flow
curl https://yourdomain.com/api/compliance/age-verification/check
```

---

### 3. CSAM Detection & Reporting (REQUIRED BY FEDERAL LAW)

**Key:** `NCMEC_API_KEY`
**Cost:** FREE for registered ESPs
**Setup Time:** 30 minutes + 2-3 days approval
**Legal Requirement:** YES - 18 U.S.C. § 2258A

**Failure to comply:**
- 10-20 years federal imprisonment
- Criminal liability for platform operators
- Platform shutdown by authorities

**What it does:**
- Scans all images for child sexual abuse material (CSAM)
- Automatically reports to National Center for Missing & Exploited Children
- Required by federal law for all user-generated content platforms

**Where to get it:**
1. Go to [https://report.cybertip.org](https://report.cybertip.org)
2. Click "Register as an Electronic Service Provider (ESP)"
3. Fill out ESP registration form:
   - Company information
   - Technical contact
   - Legal contact
   - Platform description
   - Content moderation procedures
4. Wait for approval (2-3 business days)
5. Receive API credentials via email

**Setup:**
```bash
# Add to .env
NCMEC_API_KEY="ncmec_xxxxxxxxxxxx"
NCMEC_REPORT_URL="https://report.cybertip.org/api/submit"
```

**Testing:**
```bash
# NEVER test with real CSAM!
# Use test hashes provided by NCMEC in your approval email
npm run compliance:check  # Will verify NCMEC API is configured
```

**Important:**
- You MUST test reporting within 30 days of going live
- Use ONLY the test hashes NCMEC provides
- Keep API key secret - criminal liability if leaked

---

### 4. Geolocation Service (REQUIRED)

**Key:** `IPINFO_TOKEN` (or alternative)
**Cost:** FREE tier available (50K requests/month)
**Setup Time:** 5 minutes
**Legal Requirement:** Yes (for age verification)

**What it does:**
- Detects user's country/state from IP address
- Determines which age verification laws apply
- Required for UK/US/EU compliance

**Option 1: IPinfo.io (Recommended)**

1. Go to [https://ipinfo.io/signup](https://ipinfo.io/signup)
2. Sign up for free account
3. Go to Dashboard → Access Token
4. Copy your token

```bash
# Add to .env
IPINFO_TOKEN="xxxxxxxxxxxxx"
```

**Option 2: MaxMind GeoIP2**

1. Go to [https://www.maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup)
2. Sign up and generate license key
3. Add to `.env`:

```bash
MAXMIND_LICENSE_KEY="xxxxxxxxxxxx"
MAXMIND_ACCOUNT_ID="123456"
```

**Option 3: ipapi.com**

```bash
IPAPI_KEY="xxxxxxxxxxxxx"
```

**Testing:**
```bash
# Test geolocation detection
curl https://yourdomain.com/api/compliance/age-verification/check
# Should return your jurisdiction
```

---

## 🔷 Optional But Recommended Keys

### 5. International CSAM Reporting

**IWF (UK) - Internet Watch Foundation**

```bash
IWF_API_KEY="iwf_xxxxxxxxxxxx"
```

- Required for UK operations
- Get it: [https://www.iwf.org.uk/become-a-member/](https://www.iwf.org.uk/become-a-member/)
- Cost: Membership fee varies

**INHOPE (EU) - European Hotline Network**

```bash
INHOPE_API_KEY="inhope_xxxxxxxxxxxx"
```

- Required for EU operations
- Get it: [https://www.inhope.org/EN/members](https://www.inhope.org/EN/members)

---

## 📋 Complete .env Example

```bash
# ============= CRITICAL - REQUIRED =============
DATABASE_URL="postgresql://user:pass@host:5432/fanz_core"
VERIFYMYAGE_API_KEY="vma_live_xxxxxxxxxxxxx"
VERIFYMYAGE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
NCMEC_API_KEY="ncmec_xxxxxxxxxxxx"
IPINFO_TOKEN="xxxxxxxxxxxxx"

# ============= OPTIONAL BUT RECOMMENDED =============
IWF_API_KEY="iwf_xxxxxxxxxxxx"
INHOPE_API_KEY="inhope_xxxxxxxxxxxx"

# ============= SERVER CONFIG =============
NODE_ENV="production"
PORT="3000"
SESSION_SECRET="your_random_secret_here"
```

---

## ✅ Verification Checklist

After adding API keys, run:

```bash
# 1. Check TypeScript
npm run check

# 2. Apply database migrations
npm run db:push

# 3. Validate all compliance systems
npm run compliance:check

# 4. Start server (auto-validates in production)
NODE_ENV=production npm run start
```

**Expected output:**
```
🛡️  COMPLIANCE SYSTEMS STARTUP VALIDATION

✅ Passed: 15
⚠️  Warnings: 0
❌ Critical Failures: 0

✅ ALL COMPLIANCE SYSTEMS VALIDATED - Server ready to start!
```

---

## ❌ Common Errors

### "Database connection failed"
**Cause:** Wrong DATABASE_URL
**Fix:** Check connection string format, ensure database exists

### "Age verification system not configured"
**Cause:** Missing VERIFYMYAGE_API_KEY
**Fix:** Sign up at verifymyage.com and add API key

### "NCMEC API key not set - CSAM reporting disabled"
**Cause:** Missing NCMEC_API_KEY
**Fix:** **CRITICAL** - Register at report.cybertip.org immediately
**Legal Risk:** Federal law violation

### "Geolocation service not configured"
**Cause:** Missing IP geolocation key
**Fix:** Sign up for IPinfo.io (free tier) and add token

---

## 🔐 Security Best Practices

1. **Never commit .env to git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables in production**
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - Azure Key Vault
   - HashiCorp Vault

3. **Rotate keys regularly**
   - Every 90 days recommended
   - Immediately if compromised

4. **Restrict API key permissions**
   - Use read-only keys where possible
   - Limit IP whitelist for production keys

5. **Monitor API usage**
   - Set up alerts for unusual activity
   - Check compliance dashboard daily

---

## 📞 Support

**Issues with API keys?**
- Email: support@fanz.com
- Compliance Dashboard: https://yourdomain.com/compliance-dashboard
- Emergency: legal@fanz.com (for legal/compliance issues)

**External provider support:**
- VerifyMy.io: support@verifymyage.com
- NCMEC Technical: (703) 224-2150
- IPinfo.io: support@ipinfo.io

---

## 📚 Related Articles

- [Compliance Systems Overview](./compliance-overview.md)
- [Age Verification Guide](./age-verification-guide.md)
- [CSAM Detection Guide](./csam-detection-guide.md)
- [Troubleshooting Compliance Issues](./troubleshooting-compliance.md)

---

**Last Updated:** December 2024
**Version:** 1.0
**Maintained by:** Fanz Legal & Compliance Team
