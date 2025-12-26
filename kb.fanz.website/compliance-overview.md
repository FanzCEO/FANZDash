# Compliance Systems Overview - KB.fanz.website

**Category:** Compliance & Legal > Overview
**Last Updated:** December 2024
**Applies to:** Fanz Dash, All Platforms
**Legal Requirement:** Yes - Understanding compliance is mandatory
**Target Audience:** All Users, Creators, Moderators, Administrators

---

## Overview

Fanz Dash operates under **17 different legal jurisdictions** with strict compliance requirements. This guide explains what compliance systems protect you, why they exist, and how they work together to keep the platform legal and safe.

## ⚠️ Critical Legal Context

Operating an adult content platform without proper compliance systems can result in:

- **Federal Criminal Charges:** 10-20 years imprisonment for CSAM violations
- **Multi-Million Dollar Fines:** £18M (UK), €20M (EU), $5K+ per violation (US states)
- **Platform Shutdown:** Government-ordered closure
- **Payment Processor Termination:** Permanent ban from Visa/Mastercard
- **Personal Liability:** Criminal charges for platform operators and moderators

**This is why compliance is not optional.**

---

## 🛡️ The 7 Core Compliance Systems

### 1. Age Verification System

**Legal Authority:** UK Online Safety Act 2023, 8 US State Laws, EU Regulations

**What it does:**
- Verifies all users are 18+ before accessing adult content
- Uses geolocation to determine which laws apply to each user
- Supports 4 verification methods: Third-party AVS, ID upload, Credit card, AI estimation

**Required in:**
- 🇬🇧 **United Kingdom** - Online Safety Act 2023 (£18M penalty)
- 🇺🇸 **8 US States** - Louisiana, Utah, Virginia, Texas, Arkansas, Mississippi, Montana, Kansas ($5K+ per violation)
- 🇪🇺 **EU Member States** - Various national regulations

**How it works:**
1. User attempts to access age-restricted content
2. System detects user's location (IP geolocation)
3. If user is in a jurisdiction requiring verification:
   - Age verification gate appears
   - User must verify age using one of 4 methods
   - Result stored for 7 years (federal record-keeping law)
4. Access granted after successful verification

**User Experience:**
- One-time verification (stored for future sessions)
- 5-10 minutes to complete
- Privacy-focused (no ID documents stored, only verification result)

**Related Articles:**
- [Age Verification Guide](./age-verification-guide.md) (Detailed step-by-step)
- [API Keys Setup: Age Verification](./api-keys-setup.md#2-age-verification-required-by-law)

---

### 2. CSAM Detection & Reporting

**Legal Authority:** 18 U.S.C. § 2258A (Federal Law - Mandatory)

**What it does:**
- Scans all uploaded images and videos for child sexual abuse material (CSAM)
- Automatically reports matches to National Center for Missing & Exploited Children (NCMEC)
- Blocks content immediately if CSAM detected
- Mandatory for all platforms with user-generated content

**Technology:**
- **PhotoDNA** - Microsoft's perceptual hashing algorithm
- **PDQ** - Facebook's open-source hash matching
- **Hash Database** - Known CSAM signatures (never actual images)

**How it works:**
1. User uploads image or video
2. System generates perceptual hash of content
3. Hash compared against NCMEC database
4. If match detected:
   - Content blocked immediately
   - Report sent to NCMEC with user info, IP, timestamp
   - User account flagged for investigation
   - Law enforcement notified automatically
5. If no match, upload proceeds

**Why this is federal law:**
- **18 U.S.C. § 2258A** requires all electronic service providers (ESPs) to report CSAM
- **Failure to report** = 10-20 years federal imprisonment
- **Knowingly distributing CSAM** = criminal liability for platform operators

**User Impact:**
- Uploads take 2-5 seconds longer (hash generation + check)
- No impact if uploading legal adult content
- Immediate ban if CSAM detected (zero tolerance)

**Related Articles:**
- [CSAM Detection Guide](./csam-detection-guide.md) (Technical details)
- [API Keys Setup: NCMEC Registration](./api-keys-setup.md#3-csam-detection--reporting-required-by-federal-law)

---

### 3. Payment Processor Compliance

**Legal Authority:** Visa/Mastercard Global Brand Protection Program (GBPP)

**What it does:**
- Screens all content for payment processor violations
- Prevents posting of 9 prohibited content categories
- Protects platform from payment processor termination
- Risk scoring: 0-100 (blocks if ≥80)

**9 Prohibited Content Categories:**

1. **Bestiality** - Any sexual content involving animals
2. **Incest** - Blood relatives in sexual situations (even roleplay)
3. **Minors in Sexual Situations** - Anyone appearing under 18
4. **Non-Consensual Content** - Rape scenarios, drugging, coercion
5. **Necrophilia** - Sexual content involving corpses or death
6. **Excrement/Bodily Waste** - Scat, vomit, extreme bodily functions
7. **Extreme Violence** - Gore, torture, death mixed with sexual content
8. **Trafficking Indicators** - Content suggesting human trafficking
9. **Age Play Appearing Minor** - Adults roleplaying as children in sexual contexts

**How it works:**
1. Content analyzed during upload
2. AI checks for prohibited categories
3. Risk score calculated (0-100):
   - 0-39: Low risk (allowed)
   - 40-79: Medium risk (allowed with warnings)
   - 80-100: High risk (blocked)
4. Content blocked if risk ≥80

**Why this matters:**
- **Payment processor termination is permanent**
- Visa/Mastercard share ban lists across all processors
- No payment processing = platform can't operate
- Most common reason adult platforms shut down

**User Impact:**
- Content may be blocked if it violates payment processor rules
- Appeal process available if false positive
- Clear violation = permanent ban

**Related Articles:**
- [Prohibited Content List](./prohibited-content.md) (Complete list with examples)
- [Payment Processor Compliance](./payment-processor-compliance.md) (Deep dive)

---

### 4. Trafficking Detection

**Legal Authority:** FOSTA-SESTA (US Federal Law)

**What it does:**
- Monitors content and user behavior for 13 trafficking indicators
- Flags high-risk content for human review
- Reports suspected trafficking to authorities
- Prevents platform from being used for exploitation

**13 Trafficking Indicators:**

1. Third-party management mentions
2. Location changes (user appears in multiple cities rapidly)
3. Multiple performers in single account (could indicate control)
4. Pricing anomalies (suspiciously low prices)
5. Coercion language ("have to", "forced", "need money for...")
6. Age ambiguity (looking young, mentioning school)
7. Restricted communication (can't message freely)
8. Identification document requests (suspicious)
9. Cash-only payments (avoiding tracking)
10. Hotel/motel backgrounds (transient locations)
11. Branding/tattoos (ownership marks)
12. Substance abuse indicators
13. Distress signals in content

**Risk Levels:**
- **Low:** 0-2 indicators detected
- **Medium:** 3-5 indicators detected
- **High:** 6-8 indicators detected (human review required)
- **Critical:** 9+ indicators detected (immediate investigation + report)

**How it works:**
1. AI analyzes content and metadata
2. Checks for 13 indicators
3. Risk level assigned
4. High/Critical risk → Manual moderator review
5. Confirmed trafficking → Report to FBI, account suspended

**User Impact:**
- Content may be flagged for review if indicators present
- High-risk content held until moderator review (24-48 hours)
- False positives can be appealed

**Related Articles:**
- [Trafficking Indicators](./trafficking-indicators.md) (Detailed explanation)
- [What to Do if Flagged](./troubleshooting-compliance.md#trafficking-flag)

---

### 5. GDPR Compliance (EU Users)

**Legal Authority:** EU General Data Protection Regulation (GDPR)

**What it does:**
- Protects EU users' data privacy rights
- Provides 8 data subject rights (Articles 15-22)
- Requires consent for data processing
- 72-hour breach notification requirement

**8 User Rights (GDPR Articles 15-22):**

1. **Right to Access (Article 15)** - Download all your data
2. **Right to Rectification (Article 16)** - Correct inaccurate data
3. **Right to Erasure (Article 17)** - "Right to be forgotten"
4. **Right to Restrict Processing (Article 18)** - Limit how data is used
5. **Right to Data Portability (Article 20)** - Export data in machine-readable format
6. **Right to Object (Article 21)** - Object to specific data uses
7. **Rights Related to Automated Decision-Making (Article 22)** - Contest AI decisions
8. **Right to Withdraw Consent** - Revoke consent at any time

**Important Exceptions:**
- **Age verification records MUST be kept for 7 years** (US federal law 18 U.S.C. § 2257)
- **CSAM reports cannot be deleted** (federal law)
- **Financial records kept for 7 years** (tax/audit requirements)

**Processing Deadlines:**
- **Access requests:** 30 days maximum
- **Erasure requests:** 30 days maximum
- **Breach notifications:** 72 hours to report to authorities

**User Impact:**
- EU users have enhanced privacy controls
- Can request data export, deletion, or correction
- Consent required for marketing communications

**Related Articles:**
- [GDPR User Rights](./gdpr-user-rights.md) (Complete guide)
- [How to Request Data Deletion](./gdpr-user-rights.md#right-to-erasure)

---

### 6. DSA Compliance (EU Digital Services Act)

**Legal Authority:** EU Digital Services Act (Regulation 2022/2065)

**What it does:**
- Provides EU users with notice-and-action mechanism
- Requires transparency reports
- Establishes complaint and appeal processes
- Out-of-court dispute resolution

**Key Requirements:**

1. **Notice-and-Action Mechanism**
   - Users can report illegal content
   - Platform must respond within defined timeframes
   - Clear reasoning required for decisions

2. **Transparency Reporting**
   - Quarterly reports on content moderation
   - Statistics on removals, complaints, appeals
   - Publicly accessible

3. **Internal Complaint System**
   - Users can appeal content removal decisions
   - 14-day response time
   - Clear reasoning for final decisions

4. **Statement of Reasons**
   - Every content removal must have written reasoning
   - References specific terms violated
   - Information on appeal rights

**User Experience:**
1. Content removed for policy violation
2. User receives "Statement of Reasons" explaining why
3. User can file internal complaint (appeal)
4. Platform reviews within 14 days
5. If denied, user can escalate to out-of-court dispute resolution

**Related Articles:**
- [DSA Complaints](./dsa-complaints.md) (How to appeal)
- [DSA Transparency Reports](./dsa-transparency-reports.md) (Public statistics)

---

### 7. 2257 Record Keeping

**Legal Authority:** 18 U.S.C. § 2257 (Federal Law)

**What it does:**
- Requires proof all performers are 18+
- 7-year record retention mandatory
- Custodian of Records publicly listed
- FBI inspection rights

**What Records Must Be Kept:**

For every person appearing in adult content:
1. Legal name (as shown on government ID)
2. Date of birth
3. Copy of government-issued ID
4. Aliases or stage names used
5. Content URLs where they appear
6. Date content was produced

**Record Retention:**
- **7 years minimum** from last content publication
- Cannot be deleted even if user requests (GDPR exception)
- Must be available for FBI inspection within 48 hours

**Custodian of Records:**
- Designated person responsible for maintaining records
- Name and address publicly listed on website
- Available during business hours for inspection

**Penalties for Non-Compliance:**
- Up to 5 years imprisonment (first offense)
- Up to 10 years imprisonment (repeat offense)
- Criminal liability for platform operators

**User Impact:**
- Content creators must verify age of all performers
- Records kept even after account deletion
- External platform uploads require verification

**Related Articles:**
- [2257 Compliance](./2257-compliance.md) (Complete guide)
- [Statement of 2257 Compliance](./2257-statement.md) (Public notice)

---

## 🌍 Jurisdictions Covered

Fanz Dash complies with laws in **17 jurisdictions**:

### 🇪🇺 European Union (GDPR + DSA)
- Austria, Belgium, Bulgaria, Croatia, Cyprus
- Czech Republic, Denmark, Estonia, Finland, France
- Germany, Greece, Hungary, Ireland, Italy
- Latvia, Lithuania, Luxembourg, Malta, Netherlands
- Poland, Portugal, Romania, Slovakia, Slovenia
- Spain, Sweden

### 🇬🇧 United Kingdom
- Online Safety Act 2023
- Age verification mandatory
- £18M penalty for non-compliance

### 🇺🇸 United States
- **Federal:** CSAM reporting (18 U.S.C. § 2258A), 2257 record keeping, FOSTA-SESTA
- **State Laws (Age Verification):**
  - Louisiana, Utah, Virginia, Texas
  - Arkansas, Mississippi, Montana, Kansas

---

## 📊 How Systems Work Together

```
USER UPLOADS CONTENT
        ↓
[1] Age Verification Check
    → User verified 18+? (Required in UK/US states/EU)
    → If NO: Show age verification gate
    → If YES: Continue
        ↓
[2] CSAM Detection
    → Generate hash, check NCMEC database
    → Match found? Block + Report to NCMEC
    → No match? Continue
        ↓
[3] Payment Processor Compliance
    → Analyze for 9 prohibited categories
    → Risk score ≥80? Block content
    → Risk score <80? Continue
        ↓
[4] Trafficking Detection
    → Check 13 indicators
    → High/Critical risk? Hold for review
    → Low/Medium risk? Continue
        ↓
[5] 2257 Record Keeping
    → All performers verified 18+?
    → Records maintained for 7 years
        ↓
[6] GDPR/DSA Compliance
    → EU user? Apply GDPR protections
    → Content removal? Send Statement of Reasons
        ↓
✅ CONTENT PUBLISHED
```

---

## 🚨 What Happens When Violations Occur

### Level 1: Warning
**Triggers:** Minor policy violations, first offense, unclear intent

**Action:**
- Content removed or hidden
- Warning email sent
- No account suspension
- Record kept in compliance dashboard

**Examples:**
- Borderline content (risk score 70-79)
- Minor metadata violations
- Unintentional policy breach

---

### Level 2: Temporary Suspension
**Triggers:** Multiple warnings, moderate violations, repeat offenses

**Action:**
- Account suspended 7-30 days
- All content made private
- Payment processing paused
- Required to review compliance training before reinstatement

**Examples:**
- 3+ warnings in 90 days
- Medium-risk trafficking indicators
- Payment processor violations (risk 80-89)

---

### Level 3: Permanent Ban + Legal Reporting
**Triggers:** Severe violations, federal law violations, confirmed trafficking

**Action:**
- Immediate permanent ban
- All content deleted
- Payment processing terminated
- User info reported to authorities:
  - CSAM → NCMEC + FBI
  - Trafficking → FBI + Local law enforcement
  - Child endangerment → State authorities

**Examples:**
- CSAM detected
- Confirmed trafficking
- Minors in sexual content
- Multiple severe violations

**No appeals for Level 3 bans.**

---

## 🔍 Transparency & Monitoring

### Real-Time Compliance Dashboard

**Location:** [https://dash.fanz.website/compliance-dashboard](https://dash.fanz.website/compliance-dashboard)

**What you can see:**
1. **System Health** - Status of all 7 compliance systems
2. **CSAM Scans** - Total scans, detections (numbers only, never content)
3. **Age Verification** - Stats by jurisdiction
4. **Payment Compliance** - Risk distribution
5. **GDPR Requests** - Pending/completed requests
6. **Trafficking Assessments** - Risk level breakdown

**Who can access:**
- **Administrators:** Full access to all data
- **Moderators:** Limited access (no user identities)
- **Creators:** Personal compliance status only
- **Users:** Personal verification status only

---

## 📚 Getting Started

### For New Users
1. Read [Age Verification Guide](./age-verification-guide.md)
2. Review [Prohibited Content List](./prohibited-content.md)
3. Complete age verification (if required in your location)
4. Browse platform

### For Content Creators
1. Read [Creator Guidelines](./creator-guidelines.md)
2. Understand [2257 Compliance Requirements](./2257-compliance.md)
3. Review [Prohibited Content Categories](./prohibited-content.md)
4. Set up [External Platform Upload Compliance](./platform-upload-compliance.md)
5. Complete FanzVarsity Course 2: Content Creator Compliance

### For Moderators
1. Complete [Moderator Training](./moderator-handbook.md)
2. Read [CSAM Detection Guide](./csam-detection-guide.md)
3. Learn [Trafficking Indicators](./trafficking-indicators.md)
4. Understand [Incident Response Procedures](./incident-response.md)
5. Complete FanzVarsity Course 3: Moderator Certification

### For Administrators
1. Review [Compliance Dashboard](https://dash.fanz.website/compliance-dashboard)
2. Complete [API Keys Setup](./api-keys-setup.md)
3. Read [Deployment Guide](../COMPLIANCE_DEPLOYMENT.md)
4. Understand [Legal Deadline Management](./incident-response.md#deadlines)
5. Complete FanzVarsity Course 4: Administrator Certification

---

## ❓ Frequently Asked Questions

### Why is age verification required?
Age verification is **required by law** in the UK (Online Safety Act 2023), 8 US states, and various EU countries. Platforms that allow minors to access adult content face criminal charges and multi-million dollar fines.

### How long is my data stored?
- **Age verification records:** 7 years (federal law requirement)
- **CSAM reports:** Permanent (federal law)
- **GDPR personal data:** Until account deletion (with legal exceptions)
- **Financial records:** 7 years (tax/audit requirements)

### Can I delete my account and data?
Yes, but with exceptions:
- ✅ Profile info, content, messages → Deleted
- ❌ Age verification record → Kept 7 years (18 U.S.C. § 2257)
- ❌ CSAM reports → Permanent (federal law)
- ❌ Financial transactions → Kept 7 years (tax law)

### What if I'm falsely flagged?
1. Review the [Troubleshooting Guide](./troubleshooting-compliance.md)
2. File an appeal through [Compliance Dashboard](https://dash.fanz.website/compliance-dashboard)
3. Moderator reviews within 24-48 hours
4. If EU user, you can escalate to DSA complaint process

### Why was my content blocked?
Common reasons:
1. **Payment processor violation** (risk score ≥80)
2. **Trafficking indicators detected** (high/critical risk)
3. **CSAM match** (automatic block + report)
4. **Age verification missing** (required in your location)

Check your email for "Statement of Reasons" explaining the specific violation.

### How do I appeal a decision?
- **EU users:** Use [DSA Internal Complaint System](./dsa-complaints.md)
- **All users:** File appeal via [Compliance Dashboard](https://dash.fanz.website/compliance-dashboard)
- **Response time:** 24-48 hours (14 days for DSA complaints)

---

## 📞 Support & Resources

### Emergency Legal/Compliance Issues
- **Email:** legal@fanz.com
- **Phone:** [Compliance Hotline Number]
- **Hours:** 24/7 for critical issues

### General Compliance Questions
- **Email:** compliance@fanz.com
- **Support Portal:** [https://support.fanz.website](https://support.fanz.website)
- **Response Time:** 24-48 hours

### Reporting Violations
- **CSAM:** Automatically reported to NCMEC
- **Trafficking:** trafficking@fanz.com
- **Other:** report@fanz.com

### Training & Certification
- **FanzVarsity:** [https://fanzvarsity.com](https://fanzvarsity.com)
- **Compliance 101 (Free):** Required for all users
- **Creator Training:** Required before monetization
- **Moderator Certification:** Required for moderation team

---

## 🔗 Related Articles

### Getting Started
- [API Keys Setup Guide](./api-keys-setup.md)
- [Age Verification Guide](./age-verification-guide.md)
- [Creator Guidelines](./creator-guidelines.md)

### Compliance Deep Dives
- [CSAM Detection Technical Guide](./csam-detection-guide.md)
- [Payment Processor Compliance](./payment-processor-compliance.md)
- [Trafficking Indicators Explained](./trafficking-indicators.md)
- [2257 Record Keeping Requirements](./2257-compliance.md)

### User Rights & Policies
- [GDPR User Rights Guide](./gdpr-user-rights.md)
- [DSA Complaints Process](./dsa-complaints.md)
- [Prohibited Content List](./prohibited-content.md)
- [Privacy Policy](../client/src/pages/PrivacyPolicy.tsx)
- [Terms of Service](../client/src/pages/TermsOfService.tsx)

### Operations & Moderation
- [Moderator Handbook](./moderator-handbook.md)
- [Incident Response Procedures](./incident-response.md)
- [Troubleshooting Compliance Issues](./troubleshooting-compliance.md)
- [External Platform Upload Compliance](./platform-upload-compliance.md)

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Legal & Compliance Team
**Next Review:** March 2025

---

**Legal Disclaimer:** This document is for informational purposes only and does not constitute legal advice. Consult with qualified legal counsel for specific compliance questions. Compliance requirements may change as laws are updated.
