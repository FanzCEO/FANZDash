# CSAM Detection & Reporting Guide - KB.fanz.website

**Category:** Compliance & Legal > CSAM Detection
**Last Updated:** December 2024
**Applies to:** All Platforms, All Uploads
**Legal Requirement:** Yes - 18 U.S.C. § 2258A (Federal Mandatory Reporting)
**Target Audience:** Moderators, Technical Users, Administrators

---

## Overview

Child Sexual Abuse Material (CSAM) detection is **federally mandated** for all electronic service providers under 18 U.S.C. § 2258A. This guide explains how CSAM detection works, the technology behind it, federal reporting requirements, and what happens when CSAM is detected.

**This system is automatic, mandatory, and cannot be disabled.**

---

## Critical Warning for All Staff

**If you encounter suspected CSAM:**

1. **DO NOT VIEW, DOWNLOAD, OR SHARE THE CONTENT**
   - Viewing CSAM is a federal crime (18 U.S.C. § 2252)
   - 5-20 years federal imprisonment per violation
   - Applies to everyone, including moderators and administrators

2. **IMMEDIATELY REPORT TO COMPLIANCE TEAM**
   - Email: csam@fanz.com
   - Phone: [Emergency Compliance Hotline]
   - Do not investigate further yourself

3. **DO NOT CONTACT THE USER**
   - Federal law prohibits notification
   - May interfere with law enforcement investigation

4. **DOCUMENT ONLY METADATA**
   - User ID, upload timestamp, IP address
   - Never describe content details

**When in doubt, report immediately. False positives are acceptable. Failing to report is a federal crime.**

---

## Legal Authority

### 18 U.S.C. § 2258A - Mandatory Reporting

**Full Title:** "Reporting requirements of providers of electronic communication services or remote computing services"

**Key Requirements:**

1. **Mandatory Reporting**
   - Any provider of electronic communication services must report known CSAM
   - Report must be made to National Center for Missing & Exploited Children (NCMEC)
   - "As soon as reasonably possible" after detection

2. **Required Information in Report**
   - Apparent child pornography
   - Uploading user information (name, email, IP address)
   - When and how material was detected
   - Complete copy of the material or access to it
   - Any other relevant information

3. **Criminal Penalties for Non-Compliance**
   - **Knowingly and willfully failing to report:** Up to 10 years imprisonment
   - **Second or subsequent offense:** Up to 20 years imprisonment
   - **Criminal fines:** Up to $250,000 per violation

4. **No Duty to Monitor**
   - Federal law does NOT require proactive monitoring
   - However, if CSAM is discovered, reporting is mandatory
   - Most platforms voluntarily implement detection systems

5. **Protection from Liability**
   - Good faith reports protected from civil and criminal liability
   - Cannot be sued for reporting suspected CSAM
   - Protection extends to preservation of evidence

### Related Federal Laws

**18 U.S.C. § 2252 - Possession**
- Knowingly possessing CSAM: 5-20 years imprisonment
- Applies to everyone, including platform operators

**18 U.S.C. § 2252A - Distribution**
- Knowingly distributing CSAM: 5-20 years imprisonment
- Platforms can be held liable if knowingly allowing distribution

**18 U.S.C. § 2251 - Production**
- Sexual exploitation of children: 15-30 years imprisonment
- Production of CSAM: Mandatory minimum 15 years

---

## How CSAM Detection Works

### System Overview

Fanz Dash uses a multi-layer CSAM detection system:

```
USER UPLOADS IMAGE/VIDEO
        ↓
[1] PRE-UPLOAD HASH GENERATION
    → Generate PhotoDNA hash
    → Generate PDQ hash
    → Generate MD5 hash (for exact matches)
        ↓
[2] HASH DATABASE COMPARISON
    → Check against NCMEC database
    → Check against Internet Watch Foundation (IWF) database
    → Check against internal blocklist
        ↓
[3] MATCH DETECTION
    → Exact match (MD5)? → BLOCK + REPORT
    → PhotoDNA match? → BLOCK + REPORT
    → PDQ match? → BLOCK + REPORT
    → No match? → Continue to AI screening
        ↓
[4] AI CONTENT ANALYSIS (Secondary Check)
    → Detect apparent age of subjects
    → Detect sexual content
    → Flag if both present (age <18 + sexual)
    → High confidence? → BLOCK + MANUAL REVIEW
        ↓
[5] MANUAL REVIEW (If AI Flagged)
    → Trained moderator reviews (without viewing full content)
    → Uses blurred thumbnails and metadata
    → Confirmed CSAM? → REPORT
    → False positive? → Release content
        ↓
UPLOAD COMPLETE OR BLOCKED
```

---

## Technology Explained

### PhotoDNA (Microsoft)

**What it is:**
- Perceptual hashing algorithm developed by Microsoft and Dartmouth College
- Creates unique digital "signature" (hash) of an image
- Hash represents visual pattern, not exact pixels

**How it works:**
1. Image converted to grayscale
2. Divided into grid (e.g., 26x26)
3. Each grid square analyzed for light/dark patterns
4. Patterns converted to mathematical hash
5. Hash compared against known CSAM hashes

**Key Features:**
- **Robust to modifications** - Detects images even if resized, cropped, color-adjusted, or slightly edited
- **Does not match similar content** - Only matches derivatives of known CSAM
- **Privacy-preserving** - Cannot reconstruct original image from hash
- **Fast** - Processes images in milliseconds

**Example:**
```
Original Image → PhotoDNA Hash: A7F3B892E5C1D...
Same image, resized 50% → PhotoDNA Hash: A7F3B892E5C1D... (MATCH)
Same image, brightness +20% → PhotoDNA Hash: A7F3B892E5C1D... (MATCH)
Different image → PhotoDNA Hash: Z1K9M3P7Q8R2... (NO MATCH)
```

**Limitations:**
- Only detects **known** CSAM (must be in database)
- Cannot detect newly created CSAM (not yet in database)
- Extreme modifications may evade detection

**Legal Status:**
- Used by FBI, Interpol, NCMEC
- Industry standard for CSAM detection
- Provided free to qualifying organizations

---

### PDQ (Facebook/Meta)

**What it is:**
- Open-source perceptual hashing algorithm developed by Facebook (now Meta)
- Similar to PhotoDNA but open-source and freely available
- Specifically designed for CSAM detection

**How it works:**
1. Image normalized (size, aspect ratio)
2. Discrete Cosine Transform (DCT) applied
3. Low-frequency components extracted
4. Quantized into 256-bit hash
5. Hash compared using Hamming distance

**Key Features:**
- **Open source** - Freely available, auditable
- **Hamming distance matching** - Allows approximate matches
- **Highly accurate** - <1% false positive rate
- **Fast processing** - Suitable for real-time upload scanning
- **Cross-platform** - Used by Facebook, Instagram, other platforms

**Comparison to PhotoDNA:**

| Feature | PhotoDNA | PDQ |
|---------|----------|-----|
| **Developer** | Microsoft | Facebook/Meta |
| **Availability** | Requires license | Open source |
| **Hash Size** | 144 bytes | 256 bits (32 bytes) |
| **Robustness** | Very high | High |
| **Speed** | Fast | Very fast |
| **Adoption** | Industry standard | Growing adoption |

**Why Use Both?**
- **Redundancy** - Two independent systems reduce false negatives
- **Coverage** - Different databases may have different content
- **Defense in depth** - If one fails, other catches it

---

### Hash Database

**What the database contains:**
- **NOT actual CSAM images** - Only hashes (digital signatures)
- Hashes of known CSAM from law enforcement databases
- Updated regularly with new known CSAM hashes

**Database Sources:**

1. **NCMEC (National Center for Missing & Exploited Children)**
   - US-based nonprofit
   - Largest CSAM hash database in the world
   - Receives reports from platforms worldwide
   - Shares hashes with verified service providers

2. **Internet Watch Foundation (IWF)**
   - UK-based organization
   - Operates global CSAM database
   - Used by platforms operating in Europe

3. **Interpol ICSE Database**
   - International Criminal Police Organization
   - Global law enforcement database
   - Restricted to verified law enforcement and platforms

4. **Platform-Specific Blocklists**
   - Internal database of confirmed CSAM detected on platform
   - Shared with other platforms (hashes only, not content)

**Database Size:**
- Millions of unique CSAM image hashes
- Thousands of video hashes
- Updated daily with new submissions

**Privacy & Security:**
- Hashes stored encrypted at rest
- Access logs maintained (who accessed, when)
- Cannot be used to reconstruct original images
- Separate from user content storage

---

### AI Content Analysis (Secondary Screening)

**Purpose:**
- Detect **new** CSAM not yet in hash databases
- Flag potentially illegal content for human review
- Analyze context (age of subjects + sexual content)

**How it works:**

**Step 1: Subject Age Estimation**
- Convolutional Neural Network (CNN) trained on age estimation
- Analyzes facial features, body proportions, skin texture
- Estimates apparent age: Child (<13), Teen (13-17), Adult (18+)

**Step 2: Sexual Content Detection**
- Separate AI model detects sexual content
- Trained on explicit adult content (legal training data only)
- Identifies nudity, sexual acts, suggestive poses

**Step 3: Combined Risk Assessment**
- If BOTH detected: Age <18 AND Sexual content
- Risk score assigned: 0-100
  - 0-49: Low risk (likely adult content)
  - 50-79: Medium risk (manual review)
  - 80-100: High risk (block immediately, urgent review)

**Risk Score Calculation:**

```
Risk Score = (Confidence_Age_Under_18 × 50) + (Confidence_Sexual_Content × 50)

Example 1:
  Age estimation: 95% confident <18
  Sexual content: 90% confident present
  Risk Score = (0.95 × 50) + (0.90 × 50) = 47.5 + 45 = 92.5 (HIGH RISK - BLOCK)

Example 2:
  Age estimation: 30% confident <18 (likely 18+)
  Sexual content: 95% confident present
  Risk Score = (0.30 × 50) + (0.95 × 50) = 15 + 47.5 = 62.5 (MEDIUM - REVIEW)

Example 3:
  Age estimation: 10% confident <18 (clearly adult)
  Sexual content: 90% confident present
  Risk Score = (0.10 × 50) + (0.90 × 50) = 5 + 45 = 50 (LOW - ALLOW)
```

**AI Model Training:**
- **NEVER trained on CSAM** - Illegal and unnecessary
- Age model trained on publicly available photos (legal, non-sexual)
- Sexual content model trained on legal adult content
- Regular bias testing across demographics

**Limitations:**
- AI can make mistakes (false positives and false negatives)
- All high-risk content reviewed by humans
- Cannot replace human judgment

---

## NCMEC Reporting Process

### What is NCMEC?

**National Center for Missing & Exploited Children**
- Private, nonprofit organization established by US Congress (1984)
- Designated clearinghouse for CSAM reports (18 U.S.C. § 2258A)
- Works with FBI, local law enforcement, Interpol
- Operates 24/7 CyberTipline

**Mission:**
- Find missing children
- Reduce child sexual exploitation
- Prevent child victimization

**Legal Authority:**
- 34 U.S.C. § 11293 - Congressional authorization
- 18 U.S.C. § 2258A - Designated reporting recipient
- Partnership with law enforcement agencies worldwide

---

### When Reports Are Made

**Automatic Reporting Triggers:**

1. **Hash Match Detected**
   - PhotoDNA or PDQ match against known CSAM database
   - Report generated automatically within 60 seconds
   - No human review needed (hash match is definitive)

2. **AI High-Risk + Manual Confirmation**
   - AI flags content as high risk (score ≥80)
   - Human moderator reviews (without viewing full content)
   - If confirmed: Report submitted within 24 hours

3. **User Report + Manual Confirmation**
   - Another user reports suspected CSAM
   - Compliance team investigates
   - If confirmed: Report submitted immediately

**NOT Automatically Reported:**
- Legal adult content (18+)
- False positives cleared by moderators
- Borderline content (e.g., teen selfies in bathing suits - no sexual content)

---

### Report Contents

Every NCMEC report includes:

**1. User Information**
- Account username and email
- Real name (if available from verification)
- IP address at time of upload
- Account creation date
- Payment information (if any)

**2. Content Information**
- Upload date and time (UTC)
- File metadata (dimensions, file size, format)
- PhotoDNA hash and PDQ hash
- URL where content was located
- Copy of the content or access credentials for law enforcement

**3. Detection Information**
- How content was detected (hash match, AI, user report)
- Detection timestamp
- Confidence score (if AI-detected)
- Any user reports or flags

**4. Platform Information**
- Platform name (Fanz Dash)
- Contact information for legal requests
- Custodian of Records information
- Preservation notice

**Example Report Structure:**
```
NCMEC CYBERTIPLINE REPORT #2024-12345678

REPORTING ENTITY
  Company: Fanz Technologies Inc.
  Platform: Fanz Dash
  Contact: legal@fanz.com
  Report Date: 2024-12-23 14:32:18 UTC

USER INFORMATION
  Username: [REDACTED]
  Email: [REDACTED]@[REDACTED].com
  IP Address: 203.0.113.45
  Location: Los Angeles, CA, USA
  Account Created: 2024-11-15

INCIDENT DETAILS
  Detection Method: PhotoDNA Hash Match
  Detection Time: 2024-12-23 14:32:03 UTC
  Upload Attempted: Yes (blocked)
  Content Type: Image (JPEG)
  Hash: [PHOTODNA HASH]

CONTENT PRESERVATION
  Status: Preserved for law enforcement
  Access: Available upon valid legal request
  Retention: Indefinite (federal requirement)

ADDITIONAL INFORMATION
  Prior violations: None
  Account status: Permanently banned
  User notified: No (federal law prohibition)
```

---

### NCMEC CyberTipline

**How to Submit Manual Reports:**

**Online:**
- URL: https://www.cybertipline.org
- Accepts reports from anyone (public, parents, platforms)
- Available 24/7/365

**By Phone:**
- 1-800-THE-LOST (1-800-843-5678)
- Staffed 24/7
- Multilingual support

**Information to Include:**
- Where you saw the content (URL, platform)
- Description of content (without viewing/possessing it)
- Username or account information
- Any identifying information about uploader

**Important:**
- **Do NOT send the actual content** (possessing/transmitting CSAM is illegal)
- Provide URL or description only
- NCMEC coordinates with law enforcement for evidence collection

---

### What Happens After Reporting

**Step 1: NCMEC Receipt & Review (0-24 hours)**
- NCMEC receives report
- Analyst reviews report details
- Assigns priority level based on severity

**Step 2: Law Enforcement Notification (24-48 hours)**
- NCMEC notifies appropriate law enforcement:
  - FBI (Internet Crimes Against Children Task Force)
  - Local police (based on IP location)
  - Interpol (if international)
- Provides full report and preserved evidence

**Step 3: Investigation (Days to Months)**
- Law enforcement investigates:
  - Trace IP address to physical location
  - Obtain search warrants
  - Identify uploader
  - Determine if uploader is producer, distributor, or victim
- Platform may receive additional information requests

**Step 4: Prosecution (Months to Years)**
- Criminal charges filed
- Search warrants executed
- Arrest made
- Trial proceedings

**Step 5: Victim Identification (Ongoing)**
- NCMEC attempts to identify child victims
- Coordinates with child protection services
- Provides support resources to victims and families

---

## What Happens When CSAM Is Detected

### Immediate Automated Actions

**Within 60 seconds of detection:**

1. **Upload Blocked**
   - Content never published to platform
   - Stored in secure evidence preservation system
   - Encrypted and isolated from regular content storage

2. **User Account Actions**
   - Account immediately suspended
   - All other content made private (not deleted - may be evidence)
   - Payment processing frozen
   - Cannot create new accounts (IP and device banned)

3. **NCMEC Report Submitted**
   - Automatic report to NCMEC CyberTipline
   - Includes all required information per 18 U.S.C. § 2258A
   - Confirmation receipt logged

4. **Evidence Preservation**
   - Content preserved indefinitely
   - Access logs maintained
   - Metadata captured (IP, timestamp, device info)
   - Available to law enforcement with valid request

5. **Internal Alerts**
   - Compliance team notified
   - Incident logged in compliance dashboard
   - No alert to content moderators (to prevent viewing)

---

### Compliance Team Response

**Within 24 hours:**

1. **Investigation Review**
   - Verify automated detection was accurate
   - Review user's full account history (metadata only)
   - Check for additional violations
   - Document all findings

2. **Law Enforcement Coordination**
   - Respond to any immediate law enforcement requests
   - Provide additional information if requested
   - Coordinate evidence preservation
   - Maintain chain of custody documentation

3. **Account Documentation**
   - Document permanent ban reason
   - Note: "Federal law violation - CSAM"
   - Ensure no staff member can accidentally reinstate account
   - Add to global ban database

4. **Related Account Review**
   - Check for linked accounts (same IP, device, payment method)
   - Investigate any accounts that interacted with banned account
   - Suspend related accounts if evidence of violation

---

### User Notification (What We DON'T Do)

**Federal law PROHIBITS notifying users about CSAM reports.**

**18 U.S.C. § 2258A(f) - No Notification Requirement:**
- Platforms are prohibited from notifying users about reports
- Notification could interfere with law enforcement investigations
- Violating this can obstruct justice

**What User Sees:**
- Account suspended notice: "Your account has been permanently suspended for violation of Terms of Service and federal law."
- No specific mention of CSAM
- No appeal process for federal law violations
- Email includes: "If you have questions about legal matters, contact legal@fanz.com."

**What User Does NOT See:**
- That NCMEC was notified
- That law enforcement is investigating
- Specific content that triggered detection
- Report details or evidence

---

### Permanent Ban

**No Exceptions, No Appeals:**
- CSAM violations result in immediate permanent ban
- No reinstatement under any circumstances
- No appeals process
- No exceptions for "accidents" or "didn't know"

**Ban Scope:**
- **Account-level:** Username, email banned
- **IP-level:** IP address blocked from creating accounts
- **Device-level:** Device fingerprint blocked
- **Payment-level:** Credit cards, PayPal, etc. permanently blocked
- **Cross-platform:** Shared with other Fanz platforms

**Global Ban Database:**
- Shared with other adult platforms (with consent)
- Hashed identifiers only (privacy-preserving)
- Prevents offender from accessing compliant platforms industry-wide

---

### Law Enforcement Requests

**Types of Requests:**

1. **Emergency Disclosure Request**
   - Immediate threat to child safety
   - No warrant required (18 U.S.C. § 2702(b)(8))
   - Processed immediately (within 1 hour)

2. **Search Warrant**
   - Court order requesting specific evidence
   - Requires judicial approval
   - Processed within 24 hours

3. **Subpoena**
   - Request for user identifying information
   - Does not require warrant
   - Processed within 72 hours

4. **Preservation Request**
   - Request to preserve evidence pending warrant
   - Complied with immediately
   - 90-day preservation (renewable)

**Information Provided:**
- User account details (name, email, IP, payment info)
- Upload logs and metadata
- Content (hash-matched CSAM)
- Communication records (messages, comments)
- Device information and access logs

**Legal Process Contact:**
- **Email:** legal@fanz.com
- **Phone:** [Legal Compliance Hotline]
- **Address:** [Corporate Legal Department Address]
- **Hours:** 24/7 for emergency requests

---

## False Positives

### How Often Do They Occur?

**Hash-Based Detection (PhotoDNA, PDQ):**
- False positive rate: <0.001% (extremely rare)
- Hash matches are nearly definitive
- False positives usually due to database errors

**AI-Based Detection:**
- False positive rate: ~5-10% at high threshold (score ≥80)
- Why: AI cannot perfectly determine age from appearance
- Examples: Young-looking adults (18-22), cartoon/anime characters, dolls

**Combined System:**
- AI-flagged content always reviewed by humans before reporting
- Hash matches reported automatically (false positives virtually impossible)
- Overall system false positive rate: <0.1%

---

### What Happens with False Positives

**Hash Match False Positive (Very Rare):**

1. **Investigation Triggered**
   - Content reviewed by senior compliance staff
   - Confirmed as legal adult content (clearly 18+)
   - Determined to be database error

2. **NCMEC Contacted**
   - Report submitted explaining false positive
   - Request to review hash database entry
   - Hash may be removed from database if error confirmed

3. **User Account Restored**
   - Account suspension lifted
   - Apology issued to user
   - Content reinstated
   - Compensation offered (e.g., free subscription month)

4. **System Improvement**
   - Database updated to prevent repeat false positive
   - Internal processes reviewed

---

**AI False Positive (More Common):**

1. **Manual Review Process**
   - Trained moderator reviews flagged content
   - Uses blurred thumbnails and contextual information
   - Determines: Adult content or potential violation?

2. **If Determined Legal**
   - Content approved and published
   - No report submitted
   - User never knows content was flagged
   - System learns from correction (false positive feedback)

3. **If Unclear**
   - Senior compliance officer reviews
   - Legal counsel consulted if necessary
   - Err on side of caution: "When in doubt, report"

---

### Appealing False Positive Bans

**If you believe you were falsely banned for CSAM:**

**Step 1: Contact Legal Team**
- **Email:** legal@fanz.com
- **Subject:** "Appeal - False Positive CSAM Ban"
- **Include:**
  - Username
  - Approximate upload date
  - Description of content (e.g., "professional photoshoot with adult models, all verified 18+")
  - Any model release forms or age verification documents

**Step 2: Legal Review**
- Legal team reviews case (3-5 business days)
- If clearly false positive:
  - Account reinstated immediately
  - NCMEC notified of error
  - Apology and compensation issued

**Step 3: Law Enforcement Coordination**
- If law enforcement is investigating, appeal may be delayed
- Cannot reinstate account during active investigation
- Legal team coordinates with law enforcement

**Important:**
- **DO NOT create new accounts to circumvent ban** (will result in permanent ban with no appeal)
- False positive appeals are rare but taken seriously
- Most bans are accurate and not appealable

---

## For Moderators: Safe Review Procedures

### Never View Full Content

**Rule #1: NEVER directly view suspected CSAM.**

**Federal law (18 U.S.C. § 2252) makes viewing CSAM a crime:**
- 5-20 years imprisonment per image/video
- "I was just doing my job" is NOT a legal defense
- Applies to everyone, including moderators with good intentions

---

### Approved Review Methods

**Method 1: Blurred Thumbnails**
- System generates heavily blurred thumbnail
- Blur level: Unrecognizable faces and bodies
- Can determine: Adult vs. child body proportions, sexual vs. non-sexual context
- Cannot see: Faces, identifying details, explicit content

**Method 2: Metadata Analysis**
- Review upload metadata without viewing content:
  - File name (may indicate content)
  - Image dimensions and file size
  - EXIF data (camera, GPS, timestamp)
  - Hash database match results
  - AI confidence scores

**Method 3: Contextual Information**
- User account history:
  - Other uploaded content (safe to view if legal)
  - Account age and verification status
  - Messaging history (text only)
  - User reports or flags
- Pattern recognition: Does user have history of violations?

---

### Decision Matrix for Moderators

**AI Flagged Content (Score 50-79):**

| Blurred Thumbnail Shows | Metadata Indicates | AI Confidence | Action |
|------------------------|-------------------|---------------|--------|
| Adult body proportions | Sexual content | 50-70% under 18 | **APPROVE** - Likely false positive |
| Child-like proportions | Non-sexual (e.g., family photo) | 60-75% under 18 | **APPROVE** - Not illegal |
| Unclear (very blurred) | Sexual content | 70-79% under 18 | **ESCALATE** - Senior review |
| Child-like proportions | Sexual content | 50-79% under 18 | **ESCALATE** - Senior review |

**AI Flagged Content (Score 80-100):**

| Blurred Thumbnail Shows | Metadata Indicates | AI Confidence | Action |
|------------------------|-------------------|---------------|--------|
| Adult body proportions (clear) | Sexual content | 80-100% under 18 | **ESCALATE** - AI likely wrong, but verify |
| Unclear | Sexual content | 80-100% under 18 | **REPORT** - Cannot confirm legal, err on side of caution |
| Child-like proportions | Sexual content | 80-100% under 18 | **REPORT** - High likelihood of violation |

**Hash Match:**
- **ALWAYS REPORT** - Hash matches are definitive, no review needed

---

### Escalation Procedures

**When to Escalate:**
- Unclear from blurred thumbnail
- High AI confidence (≥80%) but looks like false positive
- User claims false positive
- Any doubt or uncertainty

**How to Escalate:**

1. **Create Escalation Ticket**
   - Platform: Compliance Dashboard → Escalations
   - Include: User ID, upload ID, AI scores, your assessment
   - Mark: "High Priority" if score ≥90

2. **Notify Senior Compliance Officer**
   - Email: compliance-escalations@fanz.com
   - Phone: [Escalation Hotline] (if urgent)

3. **Do Not Proceed with Review**
   - Do not attempt to view content directly
   - Do not contact user
   - Wait for senior staff decision

4. **Senior Staff Review**
   - Senior compliance officer reviews (same blurred method)
   - May consult legal counsel
   - Makes final determination: Report or approve

**Escalation Response Time:**
- High priority (score ≥90): 1 hour
- Medium priority (score 80-89): 4 hours
- Standard priority (score <80): 24 hours

---

### Moderator Mental Health

**CSAM review is psychologically harmful, even with blurred content.**

**Support Resources:**

1. **Mandatory Counseling**
   - All moderators reviewing CSAM-flagged content required to attend monthly counseling
   - Provided free by Fanz (confidential)
   - Professional therapists specializing in trauma

2. **Rotation Policy**
   - No moderator reviews CSAM-flagged content for more than 4 hours per week
   - Rotate moderators every 3 months to different teams
   - Mandatory 1-week break every quarter

3. **Immediate Incident Support**
   - If you accidentally view CSAM or are disturbed by a case:
     - Stop immediately
     - Contact Employee Assistance Program (EAP): [EAP Phone]
     - Take remainder of day off (paid)
     - Mandatory check-in with counselor within 48 hours

4. **Signs of Burnout**
   - Trouble sleeping
   - Intrusive thoughts about work
   - Anxiety or depression
   - Avoiding work or certain tasks
   - **If experiencing any of these: Contact EAP immediately**

**You are not alone. This work is difficult. Mental health support is mandatory and confidential.**

---

## Technical Implementation Details

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER UPLOADS CONTENT                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               UPLOAD SERVICE (Pre-Processing)                │
│  • Validate file format                                      │
│  • Extract metadata (EXIF, dimensions, file size)            │
│  • Generate unique upload ID                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               HASH GENERATION SERVICE                        │
│  • Generate MD5 hash (exact match detection)                 │
│  • Generate PhotoDNA hash (perceptual match)                 │
│  • Generate PDQ hash (perceptual match)                      │
│  • Processing time: <500ms per image                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               HASH DATABASE LOOKUP                           │
│  • Query NCMEC database (PhotoDNA)                           │
│  • Query IWF database (PDQ)                                  │
│  • Query internal blocklist (MD5, PhotoDNA, PDQ)            │
│  • Lookup time: <100ms                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  MATCH FOUND?   │
                    └─────────────────┘
                       ↙ YES    NO ↘
                      ↓              ↓
    ┌─────────────────────────┐  ┌──────────────────────────┐
    │  IMMEDIATE BLOCK        │  │  AI CONTENT ANALYSIS     │
    │  • Upload rejected      │  │  • Age estimation        │
    │  • Report to NCMEC      │  │  • Sexual content detect │
    │  • Suspend account      │  │  • Risk score: 0-100     │
    │  • Preserve evidence    │  │  • Processing: 1-3 sec   │
    └─────────────────────────┘  └──────────────────────────┘
                                              ↓
                                  ┌─────────────────────┐
                                  │  RISK SCORE ≥50?    │
                                  └─────────────────────┘
                                     ↙ YES      NO ↘
                                    ↓               ↓
                  ┌─────────────────────────────┐  ┌────────────────┐
                  │  MANUAL REVIEW QUEUE        │  │  UPLOAD APPROVED│
                  │  • Blurred thumbnail        │  │  • Publish      │
                  │  • Moderator reviews        │  │  • Monitor      │
                  │  • Escalate if score ≥80    │  └────────────────┘
                  └─────────────────────────────┘
                                ↓
                      ┌─────────────────┐
                      │ CONFIRMED CSAM? │
                      └─────────────────┘
                       ↙ YES     NO ↘
                      ↓              ↓
        ┌─────────────────────┐  ┌──────────────────┐
        │  REPORT TO NCMEC    │  │  APPROVE UPLOAD  │
        │  • Full report      │  │  • Publish       │
        │  • Suspend account  │  │  • Update AI     │
        └─────────────────────┘  └──────────────────┘
```

---

### Hash Database Integration

**NCMEC Database:**
- **Connection:** Secure API over HTTPS
- **Authentication:** API key + IP whitelisting
- **Rate Limits:** 10,000 queries/minute
- **Response Time:** <100ms average
- **Update Frequency:** Real-time (new hashes propagated within 1 hour)

**Database Schema (Internal):**
```sql
CREATE TABLE csam_hashes (
    hash_id UUID PRIMARY KEY,
    hash_type VARCHAR(20), -- 'PhotoDNA', 'PDQ', 'MD5'
    hash_value VARCHAR(255),
    source VARCHAR(50), -- 'NCMEC', 'IWF', 'Interpol', 'Internal'
    added_date TIMESTAMP,
    last_updated TIMESTAMP,
    confidence_level INTEGER, -- 0-100
    INDEX (hash_value),
    INDEX (hash_type, hash_value)
);

CREATE TABLE csam_detections (
    detection_id UUID PRIMARY KEY,
    upload_id UUID,
    user_id UUID,
    hash_matched VARCHAR(255), -- Which hash triggered
    hash_type VARCHAR(20),
    detection_time TIMESTAMP,
    reported_to_ncmec BOOLEAN,
    ncmec_report_id VARCHAR(50),
    evidence_preserved BOOLEAN,
    evidence_location VARCHAR(255),
    investigation_status VARCHAR(50),
    INDEX (user_id),
    INDEX (detection_time),
    INDEX (ncmec_report_id)
);
```

---

### AI Models

**Age Estimation Model:**
- **Architecture:** ResNet-50 CNN
- **Input:** 224x224 RGB image (face crop)
- **Output:** Age category probabilities
  - Child (0-12): 0-100%
  - Teen (13-17): 0-100%
  - Young Adult (18-25): 0-100%
  - Adult (26+): 0-100%
- **Training Data:** 5M faces (public datasets, legal photos only)
- **Accuracy:** 92% for clear, frontal faces
- **Inference Time:** 50ms per image

**Sexual Content Detection Model:**
- **Architecture:** EfficientNet-B4
- **Input:** 380x380 RGB image (full frame)
- **Output:** Sexual content probability 0-100%
  - Categories: Nudity, sexual acts, suggestive poses
- **Training Data:** 2M images (legal adult content only)
- **Accuracy:** 96% precision, 94% recall
- **Inference Time:** 120ms per image

**Combined Processing:**
- Both models run in parallel
- Total processing time: ~150ms per image
- GPU acceleration on NVIDIA T4 instances

---

### Evidence Preservation

**Storage Location:**
- Separate encrypted storage cluster
- Geographically isolated from production storage
- Redundant backups (3 copies minimum)

**Encryption:**
- **At Rest:** AES-256 encryption
- **Encryption Keys:** Hardware Security Module (HSM) managed
- **Key Rotation:** Every 90 days
- **Access Control:** Role-based, multi-factor authentication required

**Access Logging:**
```sql
CREATE TABLE evidence_access_log (
    log_id UUID PRIMARY KEY,
    evidence_id UUID,
    accessed_by UUID, -- Staff member ID
    access_time TIMESTAMP,
    access_purpose VARCHAR(255), -- 'Law Enforcement Request', 'Internal Review', etc.
    legal_request_id VARCHAR(100), -- Warrant/subpoena number
    IP_address VARCHAR(50),
    duration_seconds INTEGER,
    INDEX (evidence_id),
    INDEX (accessed_by),
    INDEX (access_time)
);
```

**Retention Policy:**
- **Indefinite retention** for law enforcement evidence
- Cannot be deleted (federal requirement)
- Reviewed annually for continued necessity

---

## Statistics & Transparency

### Public Transparency Reports

**Published Quarterly:**
- URL: https://transparency.fanz.website/csam

**Statistics Included:**
- Total uploads scanned
- Hash matches detected
- AI flags generated
- Reports submitted to NCMEC
- False positive rate
- Average detection time

**Example Report:**

```
FANZ DASH CSAM DETECTION TRANSPARENCY REPORT
Q4 2024 (October - December 2024)

UPLOAD STATISTICS
  Total uploads scanned: 15,234,567
  Images: 12,456,123
  Videos: 2,778,444

DETECTION STATISTICS
  Hash matches (PhotoDNA): 127
  Hash matches (PDQ): 89
  Hash matches (MD5): 45
  AI flags (score ≥50): 1,247
  AI flags (score ≥80): 156

REPORTING STATISTICS
  Reports to NCMEC: 183
  Hash match reports: 161 (88%)
  AI-confirmed reports: 22 (12%)
  Average reporting time: 3.2 minutes

MANUAL REVIEW STATISTICS
  AI flags reviewed: 1,247
  False positives: 1,091 (87.5%)
  Confirmed violations: 22 (1.8%)
  Escalations: 134 (10.7%)

ACCOUNT ACTIONS
  Permanent bans: 183
  Related accounts suspended: 47
  Accounts reinstated (false positives): 0

LAW ENFORCEMENT
  Search warrants received: 23
  Subpoenas received: 15
  Emergency disclosure requests: 8
  Average response time: 4.2 hours
```

**Privacy Note:** Individual cases never disclosed publicly. Statistics only.

---

### Internal Dashboard

**For Administrators and Compliance Team:**

**Real-Time Metrics:**
- Current uploads being scanned
- Detection rate (detections per 100K uploads)
- Average hash lookup time
- AI model performance
- NCMEC reporting status

**Alerts:**
- Spike in detections (potential coordinated attack)
- System downtime or errors
- Law enforcement urgent requests
- Database updates

**Access:**
- URL: https://dash.fanz.website/compliance/csam
- Requires: Admin credentials + 2FA
- Audit logged

---

## FAQ for Moderators and Staff

### Can I view content to verify it's CSAM before reporting?

**NO. NEVER.**

Viewing CSAM is a federal crime (18 U.S.C. § 2252). You must use blurred thumbnails and metadata only. If unclear, escalate to senior compliance staff. When in doubt, report - false positives are legally acceptable.

---

### What if a user claims they're being falsely accused?

1. **Do not discuss specifics with the user**
   - Refer them to legal@fanz.com
   - Do not reveal what content triggered detection
   - Do not provide report details

2. **Document the appeal**
   - User ID, appeal text, timestamp
   - Forward to legal team

3. **Legal team handles all appeals**
   - Reviews case independently
   - Coordinates with NCMEC if necessary
   - Determines if false positive

---

### What if I accidentally see CSAM?

1. **Stop immediately** - Close the content, do not continue viewing
2. **Report to compliance** - Email csam@fanz.com immediately
3. **Document** - Write down what happened (how you accessed it, timestamp)
4. **Contact EAP** - Employee Assistance Program: [EAP Phone]
5. **Take the day off** - Mandatory paid leave for remainder of day
6. **Counseling** - Schedule appointment with therapist within 48 hours (required)

**You will not be punished for accidental exposure.** This is a known occupational hazard. Mental health support is mandatory and confidential.

---

### Can we disable CSAM detection for verified creators?

**No. Absolutely not.**

Federal law (18 U.S.C. § 2258A) requires reporting of all CSAM, regardless of source. Verified creators, paid accounts, trusted users - everyone is scanned. No exceptions.

---

### What if it's cartoon/anime CSAM (not real children)?

**Still illegal in many jurisdictions.**

- **Federal law (18 U.S.C. § 1466A):** Virtual/cartoon CSAM is illegal
- **Some AI-generated content:** May be illegal under federal law
- **When in doubt:** Report to NCMEC, let law enforcement decide

**Platform policy:** All simulated CSAM (cartoon, 3D, AI-generated) is prohibited and reported.

---

### How long until police arrest someone after we report?

**Varies widely: Days to months, sometimes years.**

Factors:
- Severity of content
- Other ongoing investigations
- Resources available to law enforcement
- Complexity of case (international, encrypted, etc.)

**We are not notified of arrest outcomes** unless we're called as witnesses (rare).

---

### Can users sue us for false positives?

**No.**

18 U.S.C. § 2258A(e) provides immunity from civil liability for good faith reports of suspected CSAM. Even if the report is ultimately determined to be a false positive, the platform cannot be sued.

**Exception:** Intentional false reports or gross negligence (extremely rare).

---

### What if CSAM is in a private message (not public)?

**Still must be reported.**

Federal law applies to all content on the platform, public or private. Private messages, direct messages, encrypted chats - all are scanned and subject to reporting requirements.

**Users have no expectation of privacy for illegal content.**

---

## Training & Certification

### Required Training for Moderators

**Before reviewing any flagged content:**

1. **CSAM Detection Training** (4 hours)
   - Federal law overview
   - Technology explanation
   - Safe review procedures
   - Escalation protocols
   - Mental health resources

2. **Legal Compliance Training** (2 hours)
   - 18 U.S.C. § 2258A requirements
   - Evidence preservation
   - Law enforcement coordination
   - Liability and immunity

3. **Mental Health Awareness** (1 hour)
   - Trauma-informed practices
   - Recognizing burnout
   - Self-care strategies
   - When to seek help

**Annual Recertification:**
- Required every 12 months
- 2-hour refresher course
- Updated legal/policy changes
- Mental health check-in

**Training Platform:**
- FanzVarsity: https://fanzvarsity.com/courses/csam-detection
- Certificate issued upon completion
- Required for all compliance staff and moderators

---

### Training Materials

**Included in Training:**
- Video lectures from legal counsel
- Safe review simulations (using synthetic test content)
- Case studies (anonymized, real cases)
- Q&A with senior compliance staff
- Mental health resources handbook

**NOT Included:**
- Actual CSAM (illegal to possess, even for training)
- Detailed descriptions of CSAM
- Content that could be traumatizing

---

## Contact & Support

### Emergency CSAM Reports

**Internal (Fanz Staff):**
- **Email:** csam@fanz.com
- **Phone:** [CSAM Hotline - 24/7]
- **Slack:** #csam-incidents (monitored 24/7)

**External (Public Reports):**
- **NCMEC CyberTipline:** https://www.cybertipline.org
- **Phone:** 1-800-THE-LOST (1-800-843-5678)

---

### Legal/Law Enforcement Requests

**Fanz Legal Department:**
- **Email:** legal@fanz.com
- **Phone:** [Legal Compliance Hotline - 24/7]
- **Fax:** [Legal Fax Number]
- **Physical Address:**
  Fanz Technologies Inc.
  Attn: Legal Department - Law Enforcement Requests
  [Corporate Address]

**For Subpoenas/Warrants:**
- Include: Case number, user identification, specific content requested
- Response time: 24-72 hours depending on request type

---

### Employee Assistance Program (EAP)

**For Moderators/Staff:**
- **Phone:** [EAP Hotline - 24/7]
- **Website:** [EAP Portal]
- **Services:** Free confidential counseling, crisis support, referrals

---

## Related Articles

### Compliance & Legal
- [Compliance Systems Overview](./compliance-overview.md)
- [Moderator Handbook](./moderator-handbook.md)
- [2257 Record Keeping Requirements](./2257-compliance.md)
- [Prohibited Content List](./prohibited-content.md)

### Operations
- [Incident Response Procedures](./incident-response.md)
- [API Keys Setup: NCMEC Registration](./api-keys-setup.md#3-csam-detection--reporting-required-by-federal-law)
- [Troubleshooting Compliance Issues](./troubleshooting-compliance.md)

### User Rights
- [GDPR User Rights](./gdpr-user-rights.md)
- [Privacy Policy](../client/src/pages/PrivacyPolicy.tsx)
- [Terms of Service](../client/src/pages/TermsOfService.tsx)

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Legal & Compliance Team
**Next Review:** January 2025

---

**Legal Disclaimer:** This document is for informational and training purposes only. It does not constitute legal advice. All staff must comply with federal law (18 U.S.C. § 2258A) regarding mandatory CSAM reporting. Failure to report is a federal crime punishable by up to 20 years imprisonment. When in doubt, report immediately and consult legal counsel.

**Critical Reminder:** NEVER view suspected CSAM directly. Use blurred thumbnails and metadata only. Viewing CSAM is a federal crime, even for moderators and compliance staff. Your safety and legal protection are paramount.
