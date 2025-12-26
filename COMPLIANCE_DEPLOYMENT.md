# 🛡️ Compliance Systems Deployment Guide

## Overview
This guide covers deployment of the comprehensive legal compliance systems for Fanz Dash, including age verification, CSAM detection, payment processor compliance, GDPR, DSA, and trafficking detection.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Environment Variables
Add these to your `.env` file:

```bash
# Database (Required)
DATABASE_URL="postgresql://username:password@host:5432/fanz_core"

# Age Verification (Required for UK/US/EU users)
VERIFYMYAGE_API_KEY="your_verifymyage_api_key"
VERIFYMYAGE_WEBHOOK_SECRET="your_webhook_secret"

# CSAM Detection (Required by Federal Law)
NCMEC_API_KEY="your_ncmec_api_key"
NCMEC_REPORT_URL="https://report.cybertip.org/api/submit"

# Optional but Recommended
IWF_API_KEY="your_iwf_api_key"  # International Watch Foundation (UK)
INHOPE_API_KEY="your_inhope_api_key"  # EU hotline network

# Geolocation (for jurisdiction detection)
IPINFO_TOKEN="your_ipinfo_token"  # Or use ipapi, MaxMind, etc.

# Server Configuration
NODE_ENV="production"
PORT="3000"
```

### Step 2: Database Migration
```bash
# Generate and apply database migrations
npm run db:push

# Verify tables were created
psql $DATABASE_URL -c "\dt *compliance*"
```

Expected output:
```
age_verification_records
csam_detection_reports
payment_processor_reviews
gdpr_data_subject_requests
dsa_notices
trafficking_assessments
... (13 tables total)
```

### Step 3: VerifyMy.io Configuration
1. Login to [VerifyMy.io dashboard](https://verifymyage.com)
2. Navigate to **API Settings**
3. Add webhook endpoint: `https://yourdomain.com/api/compliance/age-verification/callback`
4. Copy API key to `.env`
5. Test webhook: `curl -X POST https://yourdomain.com/api/compliance/age-verification/callback -H "Content-Type: application/json" -d '{"test": true}'`

### Step 4: NCMEC Registration
1. Visit [NCMEC CyberTipline](https://report.cybertip.org)
2. Register as an Electronic Service Provider (ESP)
3. Complete compliance questionnaire
4. Obtain API credentials
5. **Critical:** Test reporting within 30 days of going live (federal requirement)

### Step 5: Build & Deploy
```bash
# Build frontend and backend
npm run build

# Start production server
npm run start

# Or with PM2
pm2 start dist/index.js --name fanz-dash
pm2 save
```

---

## 🔍 System Verification

### Health Check
```bash
curl https://yourdomain.com/api/compliance/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "ageVerification": {"status": "healthy"},
    "csamDetection": {"status": "healthy"},
    "paymentProcessor": {"status": "healthy"},
    "gdprDataProtection": {"status": "healthy"},
    "dsaCompliance": {"status": "healthy"},
    "traffickingDetection": {"status": "healthy"}
  }
}
```

### Test Age Verification Flow
```bash
# Check age verification requirement (should detect jurisdiction)
curl https://yourdomain.com/api/compliance/age-verification/check

# Initiate verification
curl -X POST https://yourdomain.com/api/compliance/age-verification/initiate \
  -H "Content-Type: application/json" \
  -d '{"method": "third_party_avs"}'
```

### Test Content Upload with Compliance Checks
```bash
# Upload test image (will run CSAM detection, payment compliance, trafficking check)
curl -X POST https://yourdomain.com/api/upload/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session" \
  -d '{
    "contentUrl": "https://example.com/test-image.jpg",
    "contentType": "image",
    "context": {
      "title": "Test Content",
      "description": "Testing compliance systems"
    }
  }'
```

---

## 📊 Monitoring & Alerts

### Access Compliance Dashboard
Navigate to: `https://yourdomain.com/compliance-dashboard`

**Key Metrics to Monitor:**
- CSAM detections (should be 0 in normal operations)
- Age verification success rate (target: >95%)
- Payment processor risk scores (average should be <30)
- Trafficking assessments (critical risks should be rare)

### Set Up Alerts

**Critical Alerts (Immediate Action Required):**
- CSAM detection → Email legal@, security@, executive team
- Critical trafficking risk → FBI reporting within 24h
- Age verification system failure → Block content access

**Warning Alerts:**
- High payment processor risk scores → Manual review
- GDPR request approaching deadline (30 days)
- DSA notice approaching deadline (24h)

**Monitoring Tools:**
- Use `/api/compliance/health` endpoint (refresh every 30 seconds)
- Set up DataDog/New Relic for service monitoring
- Create Slack/Discord webhook for critical alerts

---

## 🔐 Security Best Practices

### 1. Secure Environment Variables
```bash
# Never commit .env to git
echo ".env" >> .gitignore

# Use secrets management in production
# AWS Secrets Manager, Google Cloud Secret Manager, or Vault
```

### 2. Database Encryption
```sql
-- Enable PostgreSQL encryption at rest
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

### 3. API Rate Limiting
Already implemented in `server/routes.ts`:
- General API: 100 req/min
- Age verification: 10 req/min
- CSAM scanning: 50 req/min

### 4. HTTPS Required
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.3 TLSv1.2;

    location /api/compliance/ {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 📋 Compliance Checklist

### Pre-Launch (Required)
- [ ] Database tables created and indexed
- [ ] VerifyMy.io API key configured and tested
- [ ] NCMEC registration complete and API key obtained
- [ ] Age verification working for UK/US/EU jurisdictions
- [ ] CSAM detection scanning all images
- [ ] Payment processor compliance checking all content
- [ ] Privacy Policy published at `/privacy-policy`
- [ ] Terms of Service published at `/terms-of-service`
- [ ] 2257 Statement published at `/2257-statement`
- [ ] Custodian of Records designated
- [ ] Legal team briefed on compliance systems

### Week 1 Post-Launch
- [ ] Test NCMEC reporting (with test data, not real CSAM)
- [ ] Monitor age verification success rate
- [ ] Review payment processor flagged content
- [ ] Check CSAM detection logs (should show scans, no matches)
- [ ] Verify geolocation accuracy for jurisdiction detection
- [ ] Test GDPR data subject access request flow
- [ ] Review compliance dashboard daily

### Monthly Maintenance
- [ ] Review age verification stats by jurisdiction
- [ ] Export payment processor quarterly report
- [ ] Check GDPR request completion times (<30 days)
- [ ] Review DSA notices and complaints (EU users)
- [ ] Analyze trafficking detection false positives
- [ ] Update jurisdiction requirements if laws change
- [ ] Backup compliance records

### Quarterly Reviews
- [ ] Generate payment processor compliance report for Visa/MC
- [ ] Review and update prohibited content keywords
- [ ] Audit CSAM detection hash database updates
- [ ] Test age verification failover systems
- [ ] Review legal policy pages for accuracy
- [ ] Update 2257 Statement if custodian changes
- [ ] Compliance system penetration testing

---

## 🚨 Incident Response

### CSAM Detection Alert
**Immediate Actions (Within Minutes):**
1. Content is automatically blocked ✅ (system handles this)
2. User account is automatically suspended ✅ (system handles this)
3. Report is automatically submitted to NCMEC ✅ (system handles this)

**Follow-Up Actions (Within 24 Hours):**
1. Legal team reviews detection
2. Preserve evidence for law enforcement
3. Document incident in compliance log
4. Review user's other content for violations
5. Respond to any law enforcement requests

### Age Verification System Failure
**Immediate Actions:**
1. System automatically fails closed (blocks access) ✅
2. Alert sent to technical team
3. Switch to backup verification provider if available

**Resolution Steps:**
1. Check VerifyMy.io API status
2. Verify API keys are valid
3. Check database connectivity
4. Review error logs: `tail -f logs/compliance.log`
5. Test with manual verification as fallback

### Payment Processor Non-Compliance
**High Risk Content Detected:**
1. Content automatically quarantined ✅
2. Creator notified of violation
3. Manual review by compliance team
4. Decision: approve with edits, reject, or ban creator

**Visa/Mastercard Audit:**
1. Export quarterly report: `GET /api/compliance/payment-processor/report`
2. Provide prohibited content stats
3. Demonstrate auto-blocking system
4. Show manual review process

### GDPR Breach (Data Leak)
**Within 72 Hours (GDPR Article 33):**
1. Assess severity and scope of breach
2. Report to Data Protection Authority (DPA)
3. Notify affected users if high risk
4. Document breach in GDPR breach log

**Follow-Up:**
1. Investigate root cause
2. Implement fixes
3. Update security measures
4. Train staff on prevention

---

## 📞 Support Contacts

### External Services
- **VerifyMy.io Support:** support@verifymyage.com
- **NCMEC Technical Support:** (703) 224-2150
- **IWF Hotline:** +44 (0)1223 20 30 30
- **FBI IC3:** https://www.ic3.gov

### Internal Contacts
- **Compliance Dashboard:** https://yourdomain.com/compliance-dashboard
- **Legal Department:** legal@fanz.com
- **Technical Support:** support@fanz.com
- **Privacy Officer:** privacy@fanz.com
- **Custodian of Records:** [Name] - legal@fanz.com

### Regulatory Authorities
- **UK Ofcom:** +44 (0)300 123 3333 (Online Safety Act)
- **EU DPOs:** Contact your local Data Protection Authority
- **US State AGs:** Contact relevant state attorney general

---

## 🔄 Updates & Maintenance

### Updating Jurisdiction Requirements
When new laws are passed (e.g., new US state age verification law):

1. Edit `server/services/ageVerificationEnforcement.ts`
2. Add jurisdiction to `JURISDICTION_REQUIREMENTS`:
```typescript
'US-FL': {  // Florida example
  jurisdiction: 'Florida, USA',
  requiresVerification: true,
  verificationMethods: ['id_document', 'third_party_avs'],
  minAge: 18,
  retentionYears: 7,
  legalReference: 'FL SB xxx (2025)',
  penaltyAmount: '$5,000 per violation'
}
```
3. Deploy update
4. Test with Florida IP address
5. Update legal documentation

### Updating Prohibited Content Categories
When payment processors update policies:

1. Edit `server/services/paymentProcessorCompliance.ts`
2. Update `PROHIBITED_CONTENT_CATEGORIES`
3. Add keywords to category
4. Deploy and monitor flagged content
5. Adjust risk score thresholds if needed

---

## 📈 Performance Optimization

### Database Indexing
```sql
-- Add indexes for frequent queries
CREATE INDEX idx_age_verification_userid ON age_verification_records(user_id);
CREATE INDEX idx_age_verification_jurisdiction ON age_verification_records(jurisdiction);
CREATE INDEX idx_csam_contentid ON csam_detection_reports(content_id);
CREATE INDEX idx_csam_status ON csam_detection_reports(status);
CREATE INDEX idx_gdpr_requests_status ON gdpr_data_subject_requests(status, created_at);
```

### Caching
```typescript
// Cache geolocation results (1 hour)
// Cache age verification status (5 minutes)
// Cache payment processor risk scores (until content changes)
```

### Background Jobs
Set up cron jobs for:
- Daily compliance stats aggregation
- Weekly GDPR request reminders
- Monthly payment processor reports
- Quarterly transparency reports (DSA)

---

## 🎯 Success Metrics

**Week 1 Targets:**
- 0 CSAM detections (if any, investigate immediately)
- >90% age verification success rate
- <1% payment processor blocks
- All GDPR requests acknowledged within 24h

**Month 1 Targets:**
- >95% age verification success rate
- <5% payment processor content flagged
- <1% trafficking false positives
- All GDPR requests completed within 30 days
- 0 compliance-related incidents

**Long-Term KPIs:**
- 99.9% uptime for age verification system
- <0.1% CSAM false positives
- <30-day average GDPR request completion
- 100% NCMEC reporting compliance
- $0 in legal fines/penalties

---

## ✅ Final Pre-Production Checklist

**Configuration:**
- [ ] All environment variables set
- [ ] Database migrations applied successfully
- [ ] VerifyMy.io webhook URL configured
- [ ] NCMEC API tested (with test data)
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured

**Testing:**
- [ ] Age verification flow tested (UK, US, EU)
- [ ] CSAM detection tested (with safe test hashes)
- [ ] Payment compliance tested (prohibited keywords)
- [ ] GDPR request flow tested
- [ ] DSA notice submission tested
- [ ] Content upload with all compliance checks tested

**Documentation:**
- [ ] Privacy Policy reviewed by legal
- [ ] Terms of Service reviewed by legal
- [ ] 2257 Statement custodian information accurate
- [ ] Internal compliance procedures documented
- [ ] Staff trained on compliance systems

**Monitoring:**
- [ ] Compliance dashboard accessible
- [ ] Critical alerts configured
- [ ] Log aggregation set up
- [ ] Backup systems tested
- [ ] Incident response plan documented

**Legal:**
- [ ] Legal team approval obtained
- [ ] Insurance coverage verified
- [ ] Custodian of Records designated
- [ ] Records storage secured
- [ ] Law enforcement contact procedures established

---

## 🎉 You're Ready to Launch!

Once all items above are checked, your Fanz Dash compliance command center is **production-ready** and protecting against:
- £18M+ in UK fines
- Federal criminal liability (CSAM, trafficking)
- Payment processor termination
- €20M+ in EU GDPR fines
- State-level penalties ($5K+ per violation)

**Need Help?** Contact legal@fanz.com or review the Compliance Dashboard at `/compliance-dashboard`

---

*Last Updated: December 2024*
*Fanz Unlimited Network LLC - Legal Compliance Systems*
