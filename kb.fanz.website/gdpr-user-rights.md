# GDPR User Rights Guide - KB.fanz.website

**Category:** Compliance & Legal > Data Privacy
**Last Updated:** December 2024
**Applies to:** EU Users Only
**Legal Requirement:** Yes - EU Regulation 2016/679 (GDPR)
**Target Audience:** EU Users

---

## Overview

The General Data Protection Regulation (GDPR) is EU law protecting the privacy and personal data of individuals in the European Union. If you're an EU resident, you have **8 fundamental data rights** under Articles 15-22 of the GDPR.

This guide explains your rights, how to exercise them, processing timelines, and important exceptions.

---

## Who Is Protected by GDPR?

### EU Residents

**GDPR applies if you are:**
- ✅ EU citizen living in the EU
- ✅ EU citizen living outside EU (data processed by EU-based entity)
- ✅ Non-EU citizen living in the EU
- ✅ Visiting the EU temporarily (GDPR applies during your visit)

**GDPR does NOT apply if you are:**
- ❌ Non-EU citizen living outside the EU (unless data processed in EU)

---

### EEA and UK

**Extended Coverage:**
- **European Economic Area (EEA):** EU + Iceland, Liechtenstein, Norway
- **United Kingdom:** UK GDPR (nearly identical to EU GDPR, post-Brexit)
- **Switzerland:** Swiss Federal Act on Data Protection (similar protections)

**For simplicity, this guide uses "EU" to mean EU/EEA/UK.**

---

## The 8 GDPR Rights

### Quick Reference

| Right | Article | Summary | Processing Time |
|-------|---------|---------|----------------|
| **Access** | Article 15 | Download all your data | 30 days |
| **Rectification** | Article 16 | Correct inaccurate data | 30 days |
| **Erasure** | Article 17 | "Right to be forgotten" | 30 days |
| **Restrict Processing** | Article 18 | Limit how data is used | 30 days |
| **Data Portability** | Article 20 | Export data in machine-readable format | 30 days |
| **Object** | Article 21 | Object to specific data uses | 30 days |
| **Automated Decision-Making** | Article 22 | Contest AI decisions | 30 days |
| **Withdraw Consent** | N/A | Revoke consent at any time | Immediate |

---

## Right to Access (Article 15)

### What It Is

**You have the right to know:**
1. What personal data we hold about you
2. Why we're processing it
3. Who we share it with
4. How long we keep it
5. Your other GDPR rights

**Also known as:** "Data Subject Access Request" (DSAR)

---

### What You'll Receive

**When you request access, you receive:**

**1. Personal Data Export**
- Account information (name, email, username)
- Profile data (bio, photos, links)
- Content (uploaded images, videos)
- Messages and comments
- Payment history (transactions, subscriptions)
- Verification records (age verification, ID verification)
- Activity logs (logins, IP addresses, device info)

**2. Data Processing Information**
- Why we collect each type of data (legal basis)
- What we use it for (purposes)
- Who we share it with (third parties, payment processors)
- How long we keep it (retention periods)
- Where it's stored (data centers, countries)

**3. Your Rights**
- Explanation of all 8 GDPR rights
- How to exercise each right

**Format:**
- Downloadable ZIP file
- JSON (machine-readable) + PDF (human-readable)
- Encrypted with password you set

---

### How to Request Access

**Step 1: Submit Request**

**Method A: Online (Recommended)**
1. Log into Fanz Dash
2. Settings → Privacy → GDPR Rights
3. Click "Request My Data" (Article 15 - Access)
4. Verify your identity (enter password + 2FA code)
5. Submit request

**Method B: Email**
1. Email: gdpr@fanz.com
2. Subject: "GDPR Article 15 - Data Access Request"
3. Include:
   - Your full name
   - Email address associated with account
   - Username
   - Proof of identity (copy of ID - we'll verify it's you)

**Step 2: Identity Verification**
- We must verify your identity (prevent unauthorized access to your data)
- If requested online: Password + 2FA sufficient
- If requested by email: May ask for ID verification or answer security questions

**Step 3: Processing**
- We have **30 days** to respond
- If complex request: Can extend to 60 days (we'll notify you)
- You'll receive email when ready

**Step 4: Download Your Data**
- Link sent to your email (valid for 14 days)
- Set password for encrypted ZIP file
- Download and extract

---

### What's Included

**Account Data:**
```json
{
  "account_info": {
    "user_id": "abc123",
    "username": "yourname",
    "email": "you@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "account_status": "active",
    "verification_status": "verified"
  },
  "profile": {
    "display_name": "Your Name",
    "bio": "Your bio text...",
    "profile_photo_url": "https://...",
    "links": ["https://...", "https://..."]
  }
}
```

**Content:**
- All uploaded images and videos
- Captions, descriptions, tags
- Upload timestamps
- View counts, engagement stats

**Messages:**
- All messages sent and received
- Timestamps, recipient/sender info
- Deleted messages (if recoverable)

**Activity Logs:**
- Login history (timestamps, IP addresses, devices)
- Content views, searches
- Settings changes

**Payment History:**
- Subscription history
- Purchases made
- Earnings (if creator)
- Payment methods (last 4 digits only)

**Verification Records:**
- Age verification method used
- Verification date
- Verification result (passed/failed)
- **Note:** ID documents stored encrypted, provided separately if you request

---

### Cost

**First request: FREE**

**Additional requests (within 12 months):**
- If unreasonable or excessive: May charge administrative fee
- Typical fee: €10-€50 depending on complexity
- We'll notify you of fee before processing

---

## Right to Rectification (Article 16)

### What It Is

**You have the right to correct inaccurate personal data.**

Examples:
- Wrong name on account
- Incorrect email address
- Outdated bio or profile information

---

### How to Request Rectification

**For Most Data: Self-Service**
- Log into Fanz Dash
- Settings → Profile / Account
- Edit and save changes
- No need to submit formal request

**For Data You Cannot Edit:**

**Method A: Online**
1. Settings → Privacy → GDPR Rights
2. Click "Rectify My Data" (Article 16)
3. Specify what data is incorrect and what it should be
4. Provide evidence if applicable (e.g., legal name change document)
5. Submit request

**Method B: Email**
- Email: gdpr@fanz.com
- Subject: "GDPR Article 16 - Rectification Request"
- Include: What's incorrect, what it should be, evidence

**Processing Time:** 30 days

---

### What Can Be Corrected

**Can Be Corrected:**
- ✅ Name, email, profile information
- ✅ Content metadata (titles, descriptions)
- ✅ Payment information

**Cannot Be Corrected:**
- ❌ Verification records (must be accurate for legal compliance)
- ❌ Activity logs (historical records must remain accurate)
- ❌ Content uploaded by others (e.g., you appear in someone else's video - contact that creator)

---

## Right to Erasure / "Right to be Forgotten" (Article 17)

### What It Is

**You have the right to have your personal data deleted in certain circumstances.**

**When you can request erasure:**
1. Data no longer necessary for original purpose
2. You withdraw consent (and no other legal basis exists)
3. You object and there are no overriding legitimate grounds
4. Data processed unlawfully
5. Legal obligation to delete
6. Data collected from a child (under 16 in most EU countries)

---

### How to Request Erasure

**Option 1: Delete Account (Full Erasure)**

1. Log into Fanz Dash
2. Settings → Account → Delete Account
3. Confirm deletion
4. Account and most data deleted within 30 days

**What's Deleted:**
- ✅ Account and profile
- ✅ Content (uploaded images, videos)
- ✅ Messages and comments
- ✅ Activity logs
- ✅ Cookies and tracking data

**What's NOT Deleted (Legal Exceptions - See Below):**
- ❌ Age verification records (7 years - US federal law)
- ❌ CSAM reports (permanent - federal law)
- ❌ Financial records (7 years - tax/audit law)
- ❌ Legal hold data (ongoing investigations)

---

**Option 2: Selective Erasure (Specific Data)**

1. Settings → Privacy → GDPR Rights
2. Click "Erase My Data" (Article 17)
3. Specify what data you want deleted
4. Provide reasoning (why erasure applies)
5. Submit request

**Processing Time:** 30 days

---

### Important Exceptions

**GDPR Article 17(3) provides exceptions. We can refuse erasure if:**

**1. Legal Obligation (Most Common Exception)**
- **Age verification records MUST be kept for 7 years** (18 U.S.C. § 2257 - US federal law)
- **CSAM reports MUST be kept permanently** (18 U.S.C. § 2258A - federal law)
- **Financial records MUST be kept for 7 years** (tax and audit requirements)

**2. Legal Claims**
- Data needed for defense of legal claims
- Example: Ongoing lawsuit involving your account

**3. Public Interest**
- Data needed for public health, research, or statistical purposes
- Rare for adult content platforms

**4. Exercise of Freedom of Expression**
- Content that is newsworthy or of public interest
- Very rare exception

**5. Archiving / Scientific Research**
- Data anonymized and used for research
- Must be genuinely anonymized (cannot identify you)

---

### Timeline After Erasure Request

**Day 0:** Request submitted
**Day 0-5:** Identity verification
**Day 5-30:** Data erasure process
- Remove from live databases
- Remove from backups
- Notify third parties (if data was shared)
**Day 30:** Confirmation email sent

**Data Erasure is Permanent and Cannot Be Undone.**

---

## Right to Restrict Processing (Article 18)

### What It Is

**You have the right to limit how we use your data (but not delete it).**

**When you can request restriction:**
1. You contest the accuracy of data (during verification period)
2. Processing is unlawful, but you don't want data deleted
3. We no longer need the data, but you need it for legal claims
4. You've objected to processing (pending verification of legitimate grounds)

---

### What "Restriction" Means

**When processing is restricted:**
- ✅ Data stored (not deleted)
- ❌ Data not used for original purpose
- ❌ Not shared with third parties (except with your consent)
- ❌ Not visible on platform (content hidden)

**Example:**
You dispute that a violation occurred. While we investigate, your account is restricted (not banned, but frozen) and content is hidden (not deleted). After investigation, restriction is lifted or account is banned.

---

### How to Request Restriction

1. Settings → Privacy → GDPR Rights
2. Click "Restrict Processing" (Article 18)
3. Select reason for restriction
4. Submit request

**Or email:** gdpr@fanz.com with "GDPR Article 18 - Restriction Request"

**Processing Time:** 30 days (or immediately if urgent)

---

## Right to Data Portability (Article 20)

### What It Is

**You have the right to receive your data in a machine-readable format and transfer it to another service.**

**Purpose:** Allows you to switch platforms without losing your data.

---

### What Data Is Portable

**Included:**
- ✅ Profile data (structured format)
- ✅ Content metadata (titles, descriptions, tags)
- ✅ Activity data (views, likes, subscriptions)
- ✅ Messages (JSON format)

**Not Included:**
- ❌ Inferred data (AI predictions, risk scores - not provided by you)
- ❌ Data processed for public interest or official authority

---

### Format

**Standard Formats:**
- JSON (JavaScript Object Notation) - machine-readable
- CSV (Comma-Separated Values) - for tabular data
- XML (for compatibility with other systems)

**Example: Profile Data in JSON**
```json
{
  "username": "yourname",
  "display_name": "Your Name",
  "bio": "Your bio...",
  "links": ["https://...", "https://..."],
  "created_at": "2024-01-15T10:30:00Z",
  "follower_count": 1234,
  "following_count": 567
}
```

---

### How to Request Portability

1. Settings → Privacy → GDPR Rights
2. Click "Export My Data (Portable Format)" (Article 20)
3. Select data categories
4. Choose format (JSON, CSV, XML)
5. Submit request

**Processing Time:** 30 days

**Delivery:** Downloadable ZIP file (link via email)

---

### Transfer to Another Service

**Direct Transfer (If Supported):**
- Some platforms support direct data transfer
- Example: Export from Fanz Dash → Import to OnlyFans (if both support portability API)
- Currently rare in adult content industry (most require manual re-upload)

---

## Right to Object (Article 21)

### What It Is

**You have the right to object to certain types of data processing.**

**You can object to:**
1. **Direct marketing** (including profiling for marketing)
2. **Processing based on legitimate interests** (e.g., analytics, fraud prevention)
3. **Processing for research or statistics**

**You CANNOT object to:**
- ❌ Processing necessary for contract (e.g., providing service you signed up for)
- ❌ Processing required by law (e.g., age verification, CSAM detection)

---

### Direct Marketing (Absolute Right)

**You have an ABSOLUTE right to object to marketing.**

**How to Opt-Out:**
1. Settings → Privacy → Communications
2. Uncheck "Promotional emails", "Marketing messages"
3. Save

**Or click "Unsubscribe" in any marketing email.**

**Effect:** We stop sending marketing emails immediately. No explanation needed.

---

### Legitimate Interests (Qualified Right)

**You can object, but we may continue if we demonstrate compelling legitimate grounds.**

**Example:**
- You object to fraud detection monitoring
- We review: Fraud detection is necessary to protect platform and users
- We may continue processing, but must explain why our interest overrides yours

**How to Object:**
1. Settings → Privacy → GDPR Rights
2. Click "Object to Processing" (Article 21)
3. Specify what processing you object to and why
4. Submit

**Processing Time:** 30 days

---

## Rights Related to Automated Decision-Making (Article 22)

### What It Is

**You have the right not to be subject to solely automated decisions with legal or significant effects.**

**Examples:**
- Loan denied solely by AI (no human review)
- Job application rejected solely by algorithm
- Account banned solely by AI (no human verification)

**GDPR requires human involvement in significant automated decisions.**

---

### Fanz Dash Automated Decisions

**Where We Use AI:**
1. **CSAM Detection** - AI flags content, but humans review before reporting
2. **Payment Processor Risk Scoring** - AI assigns risk score, humans review medium/high-risk content
3. **Trafficking Assessment** - AI detects indicators, humans investigate high-risk cases
4. **Age Estimation** - AI estimates age, but verification records are human-verified

**Human Review:**
- All significant decisions (bans, content removals) reviewed by humans
- AI assists, but does not make final decision
- You can contest AI decisions (see below)

---

### How to Contest Automated Decisions

**If you believe a decision was made solely by AI without human review:**

1. Settings → Privacy → GDPR Rights
2. Click "Contest Automated Decision" (Article 22)
3. Specify the decision (e.g., content removed, account suspended)
4. Request human review
5. Submit

**What Happens:**
- Senior moderator or compliance officer reviews decision
- Considers context, your explanation, evidence
- Makes final decision (may overturn AI decision)

**Processing Time:** 30 days (expedited for urgent cases like account suspension)

---

## Right to Withdraw Consent

### What It Is

**If we process your data based on consent, you can withdraw that consent at any time.**

**Examples:**
- Consent to marketing emails → Withdraw consent → We stop sending emails
- Consent to cookies → Withdraw consent → We stop tracking (except essential cookies)
- Consent to share data with third parties → Withdraw consent → We stop sharing

---

### How to Withdraw Consent

**Marketing:**
- Settings → Privacy → Communications → Uncheck boxes

**Cookies:**
- Settings → Privacy → Cookie Preferences → Adjust settings

**Third-Party Sharing:**
- Settings → Privacy → Data Sharing → Adjust settings

**Effect:** Immediate (consent withdrawn upon saving settings)

---

### What You Cannot Withdraw Consent For

**Processing based on legal obligations or contract cannot be withdrawn:**

- ❌ Age verification (required by law)
- ❌ CSAM detection (federal law)
- ❌ Payment processing (necessary for service)
- ❌ Account security (fraud prevention)

**Why:** These are not based on consent - they're legally required or necessary for the service to function.

---

## How to Submit GDPR Requests

### Online (Recommended)

**Step 1: Log Into Fanz Dash**
- https://dash.fanz.website

**Step 2: Navigate to GDPR Rights**
- Settings → Privacy → GDPR Rights

**Step 3: Select Right**
- Click the right you want to exercise (e.g., "Request My Data" for Article 15)

**Step 4: Complete Form**
- Fill in details (what data, why, etc.)
- Verify identity (password + 2FA)

**Step 5: Submit**
- Request submitted to GDPR team
- Confirmation email sent immediately

---

### Email

**Email Address:** gdpr@fanz.com

**Subject Line:** "GDPR [Article Number] - [Right Name]"
- Example: "GDPR Article 15 - Data Access Request"

**Include in Email:**
- Your full name
- Email address associated with account
- Username
- Specific right you're exercising (Article 15, 17, etc.)
- Details of request (what data, why, etc.)
- Proof of identity (copy of ID or government-issued document)

**Response Time:** Confirmation within 48 hours, full response within 30 days

---

### Postal Mail (Rare)

**Address:**
```
Fanz Technologies Inc.
GDPR Data Protection Officer
[Corporate Address]
[City, Postal Code]
[Country]
```

**Include:**
- Signed letter with request details
- Copy of government-issued ID
- Return address for response

**Response Time:** 30 days from receipt

---

## Processing Times & Deadlines

### Standard Timeline: 30 Days

**GDPR requires we respond within 1 month (30 days) of receiving request.**

**Timeline Breakdown:**
- **Day 0:** Request received
- **Day 0-3:** Identity verification
- **Day 3-7:** Request triaged and assigned
- **Day 7-28:** Data processed (accessed, rectified, erased, etc.)
- **Day 28-30:** Response prepared and sent

---

### Extensions (Complex Requests)

**If request is complex or we receive multiple requests, we can extend to 60 days.**

**We must:**
- Notify you within 30 days that we're extending
- Explain why extension is needed

**Examples of Complex Requests:**
- Large volume of data (terabytes of content)
- Multiple simultaneous requests from you
- Data scattered across multiple systems

---

### Expedited Requests

**If urgent (e.g., account locked, need data for legal claim), request expedited processing:**

- Email gdpr@fanz.com with "URGENT" in subject line
- Explain urgency
- We'll prioritize and aim for 7-14 days (if possible)

**No guarantee of expedited processing, but we'll try.**

---

## Fees & Charges

### Free of Charge (First Request)

**Your first request in any 12-month period is FREE.**

This includes:
- Data access (Article 15)
- Rectification (Article 16)
- Erasure (Article 17)
- Restriction (Article 18)
- Portability (Article 20)
- Objection (Article 21)
- Contesting automated decisions (Article 22)

---

### Administrative Fees (Excessive Requests)

**GDPR Article 12(5) allows "reasonable fee" for excessive requests.**

**We may charge if:**
- Multiple requests (3+ in 12 months)
- Request is manifestly unfounded (e.g., requesting data we don't have)
- Request is excessive (e.g., requesting data every week)

**Typical Fees:**
- Simple requests: €10-€20
- Complex requests: €30-€50

**We'll notify you of fee BEFORE processing. You can withdraw request if you don't want to pay.**

---

## Exceptions & Limitations

### Legal Requirements (Cannot Be Deleted)

**7-Year Retention (US Federal Law 18 U.S.C. § 2257):**
- Age verification records
- 2257 compliance records (performer IDs)
- Content production records

**Permanent Retention (Federal Law 18 U.S.C. § 2258A):**
- CSAM reports
- Evidence preservation for law enforcement

**7-Year Retention (Tax/Audit Laws):**
- Financial transaction records
- Payment history
- Tax documents

**Why:** US federal law takes precedence over GDPR. We operate in both jurisdictions and must comply with both.

**GDPR Recognizes This:** Article 17(3)(b) - Processing necessary for compliance with legal obligation.

---

### Ongoing Legal Proceedings

**If your data is subject to legal hold (investigation, lawsuit), we cannot delete it.**

- Data preserved as evidence
- Deletion could constitute obstruction of justice
- Once legal matter resolved, data can be deleted (subject to retention laws)

---

### Third-Party Data

**If your data is intertwined with others' data (e.g., you appear in someone else's video), we may not be able to delete.**

**Example:**
- You appear in a creator's video (with your consent)
- You request erasure of that video
- We cannot delete it (it's the creator's content, not yours)
- You can request we blur your face or remove identifying information

---

## Data Breach Notification

### GDPR Article 33 & 34 - Breach Notification

**If a data breach occurs, GDPR requires:**

**To Authorities (Article 33):**
- Notify EU Data Protection Authorities within **72 hours** of becoming aware of breach
- Report must include: Nature of breach, affected individuals, consequences, remedial actions

**To You (Article 34):**
- Notify affected individuals **without undue delay** if breach poses high risk to your rights/freedoms
- Notification includes: Nature of breach, likely consequences, measures taken, contact point for more info

---

### What Constitutes a Breach

**Data breach = unauthorized access, disclosure, loss, or destruction of personal data.**

**Examples:**
- Hacker accesses user database
- Employee accidentally emails user list to wrong person
- Lost laptop containing unencrypted user data
- Ransomware encrypts user data

---

### What We Do in Case of Breach

**Immediate Actions (0-24 hours):**
1. Contain breach (shut down compromised systems)
2. Assess scope (what data, how many users)
3. Begin forensic investigation

**Notification (24-72 hours):**
4. Notify Data Protection Authorities (within 72 hours)
5. Notify affected users (email + platform notification)

**Remediation (72+ hours):**
6. Fix vulnerability
7. Provide support to affected users (credit monitoring if financial data compromised)
8. Post-incident review

---

### Your Rights After a Breach

**If your data is breached:**
1. **Right to be informed** - We must tell you what happened
2. **Right to compensation** - You can claim damages if you suffered harm
3. **Right to complain** - File complaint with Data Protection Authority

---

## Complaints & Disputes

### Internal Complaint Process

**If you're unhappy with our response to your GDPR request:**

**Step 1: Email Our Data Protection Officer (DPO)**
- Email: dpo@fanz.com
- Subject: "GDPR Complaint - [Your Request]"
- Explain: What you requested, our response, why you're unhappy

**Step 2: DPO Reviews**
- Independent review of your case
- May overturn original decision
- Response within 14 days

**Step 3: Final Response**
- DPO provides final internal response
- If you're still unhappy, you can escalate externally (see below)

---

### External Complaints (Data Protection Authorities)

**If internal complaint doesn't resolve the issue, you can file complaint with your national Data Protection Authority (DPA).**

**How to File:**
1. Identify your country's DPA (see list below)
2. Visit DPA website or contact them
3. Fill out complaint form
4. Provide: Your GDPR request, our response, why you believe we violated GDPR

**DPA Will:**
- Investigate your complaint
- May conduct audit of Fanz Dash
- May order us to comply with your request
- May fine us if we violated GDPR

**Timeline:** 3-6 months (varies by DPA)

---

### EU Data Protection Authorities

**Select Countries:**

**Austria:** Österreichische Datenschutzbehörde - https://www.dsb.gv.at

**Belgium:** Autorité de protection des données - https://www.dataprotectionauthority.be

**France:** CNIL - https://www.cnil.fr

**Germany:** Federal Commissioner for Data Protection and Freedom of Information - https://www.bfdi.bund.de

**Ireland:** Data Protection Commission - https://www.dataprotection.ie

**Italy:** Garante per la protezione dei dati personali - https://www.gpdp.it

**Netherlands:** Autoriteit Persoonsgegevens - https://www.autoriteitpersoonsgegevens.nl

**Spain:** Agencia Española de Protección de Datos - https://www.aepd.es

**Full List:** https://edpb.europa.eu/about-edpb/about-edpb/members_en

---

### Legal Action

**You have the right to seek compensation through courts if you've suffered harm due to GDPR violation.**

**Article 82 - Right to Compensation:**
- Material damages (financial loss)
- Non-material damages (emotional distress, privacy violation)

**How to Pursue:**
1. Consult with lawyer specializing in data protection
2. File lawsuit in your country's courts
3. Prove: GDPR violation occurred and you suffered harm

**Note:** Most disputes resolved through DPA complaints (faster, no legal costs).

---

## FAQ for EU Users

### Does GDPR apply to me if I'm traveling outside the EU?

**Yes, if you're an EU resident.** GDPR protects EU residents regardless of where they are physically located.

---

### I deleted my account, but age verification record still exists. Why?

**US federal law (18 U.S.C. § 2257) requires 7-year retention of age verification records.**

GDPR recognizes this exception (Article 17(3)(b) - legal obligation). After 7 years, the record is automatically purged.

---

### Can I request data deletion if I'm under investigation?

**No.** If your data is subject to legal hold (investigation, lawsuit), we cannot delete it until the legal matter is resolved.

---

### How do I know if a data breach affected me?

**We will email you directly** if you're affected by a breach. Check your email and platform notifications.

---

### Can I exercise GDPR rights on behalf of someone else (e.g., deceased relative)?

**Generally no.** GDPR rights are personal and end at death.

**Exception:** Some EU countries allow relatives to exercise certain rights on behalf of deceased. Consult your national data protection authority.

---

### What if Fanz Dash refuses my GDPR request?

**We will explain why** (e.g., legal exception applies).

**If you disagree:** File complaint with your national Data Protection Authority (DPA). The DPA will investigate and order us to comply if we're in the wrong.

---

## Contact Information

### GDPR Requests

**Email:** gdpr@fanz.com
**Response Time:** Confirmation within 48 hours, full response within 30 days

---

### Data Protection Officer (DPO)

**Email:** dpo@fanz.com
**Role:** Independent oversight of GDPR compliance, internal complaints

---

### Complaints

**Internal:**
- Email: dpo@fanz.com
- Response: 14 days

**External (If Internal Complaint Not Resolved):**
- File complaint with your national Data Protection Authority
- List: https://edpb.europa.eu/about-edpb/about-edpb/members_en

---

## Related Articles

### Privacy & Data Protection
- [Privacy Policy](../client/src/pages/PrivacyPolicy.tsx)
- [DSA Complaints Guide](./dsa-complaints.md) (EU users - content moderation appeals)
- [Troubleshooting Compliance Issues](./troubleshooting-compliance.md)

### Compliance
- [Compliance Systems Overview](./compliance-overview.md)
- [Age Verification Guide](./age-verification-guide.md)
- [2257 Compliance](./2257-compliance.md)

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Legal & Compliance Team
**Next Review:** February 2025

---

**Legal Disclaimer:** This guide is for informational purposes only and does not constitute legal advice. GDPR is complex and subject to interpretation by courts and Data Protection Authorities. For specific legal questions, consult with a qualified data protection lawyer.

**Your Privacy Matters:** Fanz Dash is committed to protecting your personal data and respecting your GDPR rights. If you have questions or concerns about how we handle your data, please contact our Data Protection Officer at dpo@fanz.com.
