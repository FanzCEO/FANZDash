# Troubleshooting Compliance Issues - KB.fanz.website

**Category:** Compliance & Legal > Troubleshooting
**Last Updated:** December 2024
**Applies to:** All Users, All Platforms
**Legal Requirement:** No - Support Resource
**Target Audience:** All Users

---

## Overview

This guide helps you resolve common compliance-related issues on Fanz Dash. Whether your content was blocked, account suspended, age verification failed, or you received a policy violation notice, this guide provides step-by-step troubleshooting and solutions.

---

## Table of Contents

1. [Age Verification Problems](#age-verification-problems)
2. [Content Flagged or Blocked](#content-flagged-or-blocked)
3. [Account Suspended](#account-suspended)
4. [Payment Processor Violations](#payment-processor-violations)
5. [GDPR Request Issues](#gdpr-request-issues-eu-users)
6. [External Platform Upload Failures](#external-platform-upload-failures)
7. [2257 Compliance Issues](#2257-compliance-issues)
8. [False Positive Appeals](#false-positive-appeals)
9. [Contact Information](#contact-information)

---

## Age Verification Problems

### Issue: Age Verification Failed

**Possible Causes:**
1. ID photo unclear or unreadable
2. ID expired
3. Selfie doesn't match ID photo
4. Name on ID doesn't match account name
5. AI age estimation determined you appear under 18

---

**Solution 1: Retry with Better Photo**

**If ID photo was unclear:**
1. Retake photo in good lighting
2. Ensure all 4 corners of ID are visible
3. No glare or shadows
4. Text must be sharp and readable
5. Minimum 1280x720 pixels resolution

**Tips:**
- Use natural daylight (not flash)
- Place ID on dark, plain background
- Hold camera steady (use timer or tripod)
- Avoid reflections from plastic ID covering

---

**Solution 2: Use Different Verification Method**

**If one method failed, try another:**

| Method Failed | Try This Instead |
|---------------|------------------|
| ID Upload | Third-party AVS (VerifyMy) or Credit Card |
| AI Age Estimation | ID Upload or VerifyMy |
| Credit Card | ID Upload or VerifyMy |
| VerifyMy | ID Upload (manual review) |

**Related:** [Age Verification Guide](./age-verification-guide.md)

---

**Solution 3: Update Account Name to Match ID**

**If name mismatch:**
1. Settings → Account → Legal Name
2. Update to match name on ID exactly
3. Resubmit verification

**Note:** Display name/username can be different, but legal name must match ID.

---

**Solution 4: Renew Expired ID**

**If ID is expired:**
- Federal law requires valid (non-expired) ID for age verification
- You must renew your ID before verifying
- Upload expired ID = automatic rejection

**Where to Renew:**
- Driver's License: DMV/local motor vehicles office
- Passport: Passport office or post office
- National ID: Government office issuing IDs

---

**Solution 5: Contact Support for Manual Review**

**If you've tried everything and still failing:**

1. Email: verification@fanz.com
2. Subject: "Age Verification Issue - [Your Username]"
3. Include:
   - Username and email
   - Verification methods tried
   - Error messages received
   - Clear photos of your ID (front and back)
   - Selfie holding ID next to your face

**Response time:** 24-48 hours

---

### Issue: "Age verification required" but I'm in a non-required location

**Possible Causes:**
1. VPN/proxy detected
2. IP geolocation incorrectly detected your location
3. Account settings specify required jurisdiction

---

**Solution 1: Disable VPN/Proxy**

1. Turn off VPN/proxy service
2. Clear browser cache and cookies
3. Restart browser
4. Try accessing Fanz Dash again

**Note:** Using VPN to bypass age verification violates Terms of Service and may result in ban.

---

**Solution 2: Contact Support to Update Location**

1. Email: verification@fanz.com
2. Subject: "Incorrect Location Detection"
3. Include:
   - Username
   - Your actual location (city, state/region, country)
   - Why verification shouldn't be required (e.g., "I'm in California, but system thinks I'm in Texas")

**We'll manually review and adjust if appropriate.**

---

**Solution 3: Verify Anyway (Recommended)**

Even if not legally required in your location, age verification:
- Protects your account (higher trust score)
- Required for creator features (monetization)
- Useful if you travel to required jurisdictions

**Related:** [Age Verification Guide](./age-verification-guide.md)

---

## Content Flagged or Blocked

### Issue: Content Upload Blocked - High Risk Score

**What Happened:**
- AI flagged your content as high risk (score ≥80)
- Content blocked from uploading
- You received notification email with reason

---

**Step 1: Read Notification Email**

**Email includes:**
- Specific reason content was blocked
- Policy violated (e.g., "Payment processor violation - incest roleplay detected")
- Suggestions for how to fix (e.g., "Remove 'daddy/daughter' language from caption")

---

**Step 2: Identify Issue**

**Common Reasons:**

**Payment Processor Violation (Most Common):**
- Prohibited keywords in caption/title ("daddy/daughter", "forced", "teen", etc.)
- Content depicts prohibited categories (bestiality, incest, minors, etc.)
- Risk score ≥80

**Trafficking Indicators:**
- 6+ trafficking indicators detected
- Content suggests coercion, exploitation
- Manual review required

**CSAM Risk:**
- AI detected subject appears under 18 + sexual content
- Automatic block
- Manual review required

**2257 Non-Compliance:**
- Collaborative content with unverified performer
- Must verify all performers before uploading

---

**Step 3: Fix and Reupload**

**For Keyword Issues:**
1. Edit caption/title to remove prohibited keywords
2. Use alternative wording (see suggestions below)
3. Re-upload content

**Keyword Alternatives:**

| Prohibited | Use Instead |
|------------|-------------|
| daddy/daughter | dominant/submissive, Sir, Daddy (BDSM context with clear disclaimer) |
| forced | rough, intense, aggressive (with consent disclaimer) |
| teen | young adult, fresh face |
| barely legal | new to the scene |
| schoolgirl | student fantasy, college |

**For Visual Content Issues:**
1. Remove prohibited elements (weapons, drugs in background)
2. Ensure all performers appear clearly 18+ (mature styling)
3. Add context/disclaimers in caption
4. Re-upload

**For 2257 Issues:**
1. Add collaborator via Dashboard → Collaborators
2. They must verify age
3. Re-upload content and select verified collaborators

---

**Step 4: Request Manual Review**

**If you believe AI is wrong:**

1. Reply to block notification email
2. Explain why content is policy-compliant
3. Provide context or evidence
4. Request manual review

**Example:**
```
Subject: Re: Content Blocked - Request Manual Review

Hello,

My content (upload ID: abc123) was blocked for "incest roleplay detection" due to the word "daddy" in the caption. However, this is a BDSM dominant/submissive roleplay (Daddy Dom dynamic), NOT family roleplay.

Caption context: "Daddy doms me in this hot BDSM scene 🔥 Watch me submit to my Dom"

This is permitted under payment processor policies as it's clearly BDSM context, not incest. I've reviewed the Prohibited Content List and my content does not depict or suggest family relationships.

Please manually review. Thank you.

Username: [your_username]
Upload ID: abc123
```

**Response time:** 24-48 hours

---

### Issue: Content Removed After Upload

**What Happened:**
- Content was published but later removed
- You received "Statement of Reasons" email
- May have received warning or suspension

---

**Step 1: Review Statement of Reasons**

**Email includes:**
- What content was removed (title, URL)
- Specific policy violated
- Detection method (AI, user report, manual review)
- Appeal rights

---

**Step 2: Determine if Violation Is Valid**

**Valid Violation:**
- Content clearly violates stated policy
- Example: Caption contains "daddy/daughter" language (prohibited by payment processors)
- **Action:** Accept violation, don't re-upload similar content

**Possible False Positive:**
- Content doesn't clearly violate policy
- Example: AI flagged "daddy" in BDSM context (allowed), not incest context (prohibited)
- **Action:** Appeal (see Step 3)

**Unclear:**
- Not sure if content violates policy
- **Action:** Contact support for clarification before appealing

---

**Step 3: Appeal if False Positive**

**For EU Users (DSA Internal Complaint):**
1. Settings → Compliance → DSA Internal Complaints
2. File complaint with explanation
3. Response within 14 days
4. **Related:** [DSA Complaints Guide](./dsa-complaints.md)

**For All Users:**
1. Reply to Statement of Reasons email
2. Subject: "Appeal - Content Removal [Content ID]"
3. Explain why decision was incorrect
4. Provide evidence or context
5. Response within 24-48 hours

**Appeal Example:**
```
Subject: Appeal - Content Removal video_xyz789

Hello,

I'm appealing the removal of my video (ID: video_xyz789) for "payment processor violation - incest roleplay."

Reason for appeal:
My video was removed for containing "daddy" language, flagged as incest. However, this is a BDSM Daddy Dom/little girl (DDlg) fantasy, which is an adult consensual roleplay dynamic, NOT incest. There is no mention of family relationships, and all participants are verified adults (myself, age 25).

The caption clearly states: "BDSM roleplay with my Dom 🔥 Watch me be a good girl for Daddy" - this is a common BDSM title (Daddy = dominant partner), not family roleplay.

According to Fanz Dash's Prohibited Content List, BDSM is allowed. DDlg is a recognized BDSM subculture and should not be conflated with incest.

I request manual review by a senior moderator who understands BDSM context.

Thank you.
```

**Appeal Outcomes:**
- **Upheld:** Content reinstated, violation removed
- **Denied:** Original decision stands, content remains removed
- **Partial:** Some aspects upheld (e.g., content stays removed, but violation doesn't count against your account)

---

**Step 4: If Appeal Denied, Do NOT Re-Upload**

**If appeal is denied:**
- Original decision was correct (content violates policy)
- Do NOT re-upload same/similar content
- Repeated violations → account suspension or ban

**Options:**
- Edit content to comply (remove problematic elements) and upload as new content
- Upload to different platform with more permissive policies (e.g., ManyVids)
- Accept that this content type isn't allowed on Fanz Dash

---

## Account Suspended

### Issue: Account Temporarily Suspended

**What Happened:**
- You cannot log in
- Email notification: "Your account has been suspended for [7/14/30] days"
- Statement of Reasons provided

---

**Step 1: Review Suspension Notice**

**Email includes:**
- Reason for suspension (specific policy violated)
- Suspension duration (7, 14, or 30 days)
- Content removed (if applicable)
- Appeal rights
- What happens if further violations occur

---

**Step 2: Determine If You Can Appeal**

**Can Appeal If:**
- ✅ You believe suspension was error (false positive)
- ✅ You have evidence supporting your case
- ✅ Violation was unclear or unintentional

**Cannot Appeal (Likely) If:**
- ❌ Multiple prior violations (pattern of rule-breaking)
- ❌ Clear, intentional violation (e.g., posting prohibited content knowingly)
- ❌ Severe violation (e.g., trafficking indicators, CSAM)

---

**Step 3: File Appeal**

**For EU Users:**
- Use DSA Internal Complaint system (14-day response)
- Settings → Compliance → DSA Internal Complaints

**For All Users:**
1. Email: legal@fanz.com
2. Subject: "Suspension Appeal - [Your Username]"
3. Include:
   - Username and email
   - Suspension notification (copy/paste or screenshot)
   - Explanation of why suspension is incorrect
   - Evidence supporting your case
   - Request for review

**Response time:** 24-48 hours (14 days for EU DSA complaints)

---

**Step 4: Wait for Reinstatement**

**If appeal denied:**
- Suspension stands
- Account automatically reinstated after suspension period
- Content remains removed/private
- Warning: Further violations may result in permanent ban

**If appeal upheld:**
- Suspension lifted immediately
- Content reinstated (if applicable)
- Violation removed from record

**During Suspension:**
- Cannot access account
- Payments paused
- Subscribers not charged (subscription paused)
- Messages held (delivered after reinstatement)

---

**Step 5: After Reinstatement**

**When account is reinstated:**
1. Review Prohibited Content List and Creator Guidelines
2. Ensure future content complies with policies
3. If unsure about content, contact support@fanz.com BEFORE uploading
4. Next violation may result in permanent ban

---

### Issue: Account Permanently Banned

**What Happened:**
- Cannot log in, account disabled
- Email: "Your account has been permanently banned"
- May or may not include specific reason

---

**Reasons for Permanent Ban:**

**1. CSAM Detected**
- Federal law violation
- No appeal (federal prohibition on notification)
- Criminal investigation likely

**2. Trafficking Confirmed**
- Federal law violation (FOSTA-SESTA)
- No appeal
- Reported to FBI

**3. Multiple Violations**
- 4+ violations within 12 months
- Pattern of rule-breaking
- Appeal unlikely to succeed

**4. Severe Payment Processor Violation**
- Risk score 90-100
- Content that would get platform banned from payment processors
- Appeal possible if false positive

**5. Terms of Service Violation**
- Account sharing, fraud, harassment, doxxing, etc.
- Appeal possible depending on circumstances

---

**Step 1: Check for Notification Email**

**Email includes (usually):**
- Reason for ban (general terms)
- Whether appeal is possible
- Contact information

**No Email?**
- Check spam folder
- Email support@fanz.com to request explanation

---

**Step 2: Determine If Appeal Is Possible**

**NO APPEAL for:**
- ❌ CSAM (federal law prohibition)
- ❌ Confirmed trafficking
- ❌ Court order (legal requirement to ban)

**APPEAL POSSIBLE for:**
- ✅ Payment processor false positive
- ✅ Account compromise (someone else violated rules using your account)
- ✅ Mistaken identity (wrong account banned)
- ✅ Terms of Service violation (depending on severity)

---

**Step 3: File Appeal (If Allowed)**

1. Email: legal@fanz.com
2. Subject: "Permanent Ban Appeal - [Your Username]"
3. Include:
   - Username and email
   - Date of ban
   - Explanation of why ban is incorrect
   - Evidence (screenshots, documents, etc.)
   - Request for review by senior staff

**Response time:** 3-7 days (permanent bans require senior review)

---

**Step 4: Possible Outcomes**

**Appeal Upheld (Rare):**
- Ban overturned
- Account reinstated
- Violation removed

**Appeal Denied:**
- Ban stands
- Cannot create new account (IP, device, payment methods banned)
- Consider alternative platforms

**Partial Uphold (Very Rare):**
- Ban reduced to suspension (e.g., permanent ban → 90-day suspension)

---

**Important: Do NOT Create New Account**

**If you're banned and create new account:**
- New account will also be banned (ban evasion)
- Permanent ban with no appeal
- Possible legal action (fraud, Terms of Service violation)

**If you need adult content income:**
- Use alternative platforms (OnlyFans, Fansly, ManyVids, etc.)
- Ensure you comply with their policies (learn from mistakes on Fanz Dash)

---

## Payment Processor Violations

### Issue: Payment Processing Disabled

**What Happened:**
- You can upload content but cannot monetize
- Payments disabled
- Email: "Your payment processing has been disabled due to policy violation"

---

**Causes:**
1. Content violates payment processor policies (9 prohibited categories)
2. High-risk content pattern (multiple medium-risk violations)
3. Payment processor complaint (e.g., chargeback, fraud allegation)

---

**Solution 1: Review Violation Notice**

**Email includes:**
- Specific content that triggered violation
- Policy violated
- Steps to resolve

---

**Solution 2: Remove Violating Content**

1. Log in to Fanz Dash
2. Dashboard → Compliance → Payment Processor Violations
3. Review flagged content
4. Remove or edit content to comply
5. Request reinstatement

**Common Violations:**
- Incest language ("daddy/daughter", "stepmom", "family")
- Age play ("barely legal", "teen", "schoolgirl")
- Non-consent ("forced", "rape", "drugged")
- Extreme content (scat, vomit, blood)

**How to Fix:**
- Remove prohibited keywords from captions/titles
- Re-film content without prohibited elements
- Or remove content entirely

---

**Solution 3: Request Reinstatement**

**After removing violating content:**

1. Email: payments@fanz.com
2. Subject: "Payment Processing Reinstatement Request"
3. Include:
   - Username
   - Content removed or edited
   - Confirmation you understand policies
   - Request reinstatement

**Response time:** 3-5 business days

**Reinstatement Review:**
- Compliance team reviews your content
- Verifies violating content removed
- Checks for patterns (recurring violations)
- Approves or denies reinstatement

**If Approved:**
- Payment processing re-enabled
- Can monetize content again

**If Denied:**
- Payments remain disabled
- Must remove additional content or wait (30-90 days for review)

---

**Solution 4: Appeal to External Payment Processor**

**If Fanz Dash says violation came from payment processor directly:**

1. Identify which processor (Visa, Mastercard, Stripe, etc.)
2. Contact processor's merchant support
3. Provide evidence your content is compliant
4. Request review

**Note:** Payment processor appeals rarely succeed. Best to comply with Fanz Dash's policies.

---

## GDPR Request Issues (EU Users)

### Issue: GDPR Request Not Responded To

**What Happened:**
- You submitted GDPR request (data access, erasure, etc.)
- 30+ days passed with no response
- You're an EU resident

---

**Solution 1: Check Spam Folder**

- GDPR responses sometimes filtered as spam
- Check spam/junk folder for email from gdpr@fanz.com

---

**Solution 2: Contact Data Protection Officer**

1. Email: dpo@fanz.com
2. Subject: "GDPR Request - No Response Received"
3. Include:
   - Date of original request
   - Type of request (access, erasure, etc.)
   - Confirmation/reference number (if you received one)

**Response time:** 7 days

---

**Solution 3: File Complaint with Data Protection Authority**

**If 30+ days passed and no response:**

**Your Rights:**
- GDPR requires response within 30 days (or 60 if complex, with notification)
- Non-response is GDPR violation
- You can file complaint with your national Data Protection Authority

**How to Complain:**
1. Find your country's DPA: https://edpb.europa.eu/about-edpb/about-edpb/members_en
2. Visit DPA website
3. Fill out complaint form
4. Provide: Your GDPR request details, proof of request, no response received

**DPA will investigate and order us to comply.**

**Related:** [GDPR User Rights Guide](./gdpr-user-rights.md)

---

### Issue: GDPR Erasure Request Denied

**What Happened:**
- You requested data deletion (Article 17 - Right to Erasure)
- Request denied or partially denied
- Received explanation citing legal exceptions

---

**Common Reasons for Denial:**

**1. Legal Retention Requirements**
- Age verification records MUST be kept for 7 years (US federal law 18 U.S.C. § 2257)
- CSAM reports MUST be kept permanently (federal law)
- Financial records kept for 7 years (tax/audit law)

**2. Ongoing Legal Proceedings**
- Your data subject to legal hold (investigation, lawsuit)
- Cannot delete until legal matter resolved

**3. Other User's Content**
- You appear in someone else's content
- We cannot delete their content (it's theirs, not yours)

---

**Solution 1: Understand Exception**

**GDPR Article 17(3) provides exceptions:**
- (b) Legal obligation (most common for Fanz Dash)
- (e) Legal claims defense
- (f) Public interest, research

**If exception applies, denial is lawful.**

---

**Solution 2: Request Partial Erasure**

**If full erasure denied, request deletion of what IS deletable:**

Example:
- Age verification records: Cannot delete (7-year retention)
- Profile data: CAN delete
- Content: CAN delete
- Messages: CAN delete

**Email:** gdpr@fanz.com with "Partial Erasure Request"

---

**Solution 3: Appeal to Data Protection Authority**

**If you believe exception doesn't apply:**

1. File complaint with your national DPA
2. DPA reviews whether exception is valid
3. DPA orders erasure if we're wrong

**Related:** [GDPR User Rights Guide](./gdpr-user-rights.md#complaints--disputes)

---

## External Platform Upload Failures

### Issue: Content Blocked from Uploading to OnlyFans/Fansly

**What Happened:**
- You uploaded content to Fanz Dash
- Content approved on Fanz Dash
- Upload to OnlyFans/Fansly/other platform blocked
- Email: "Content cannot be uploaded to [Platform] - platform-specific risk"

---

**Cause:**
- Content violates external platform's policies (even if allowed on Fanz Dash)
- Most common: OnlyFans has stricter policies than Fansly or ManyVids

---

**Solution 1: Review Platform-Specific Policies**

**OnlyFans Additional Restrictions:**
- No weapons (even in background)
- No drugs/paraphernalia (even cannabis in legal states)
- Very strict on incest language (even BDSM "daddy" can be flagged)
- No hypnosis/intoxication themes
- No escort services or in-person meetups

**Fansly More Permissive:**
- Cannabis allowed (in legal jurisdictions)
- More lenient on BDSM terminology
- Bodily fluids allowed with warnings

**ManyVids Most Permissive:**
- Wide range of fetish content allowed
- Roleplay allowed (with disclaimers)

**Related:** [Platform Upload Compliance Guide](./platform-upload-compliance.md)

---

**Solution 2: Edit Content for Specific Platform**

**Create platform-specific versions:**

**Example:**
- **OnlyFans version:** Vanilla edit, no "daddy" language, weapons removed from background
- **Fansly version:** Extended edit with BDSM elements, "daddy" language okay
- **ManyVids version:** Full uncut version with all fetish elements

**How to Upload Different Versions:**
1. Upload all versions to Fanz Dash (separate uploads)
2. Tag each version with intended platform
3. Fanz Dash sends appropriate version to each platform

---

**Solution 3: Select Different Platforms**

**If content is consistently blocked on OnlyFans:**
- Don't upload to OnlyFans (use Fansly, ManyVids, etc.)
- Focus on platforms that allow your content type
- Cross-promote: "More extreme content on my ManyVids"

---

**Solution 4: Request Manual Review**

**If you believe content IS compliant with platform policy:**

1. Reply to block notification
2. Explain why content complies with platform-specific policy
3. Request manual review
4. Provide evidence or cite policy

**Response time:** 24-48 hours

---

### Issue: Content Uploaded but Removed by External Platform

**What Happened:**
- Content successfully uploaded to OnlyFans/Fansly/etc.
- Platform removed it for policy violation
- You received violation notice from platform

---

**Solution 1: Check Platform's Removal Notice**

- Platform emails violation notice
- Read specific reason
- Determine if valid violation or false positive

---

**Solution 2: Appeal to Platform Directly**

**OnlyFans Appeal:**
- Email: complaints@onlyfans.com
- Include: Content URL, explanation, evidence
- Response: 3-5 business days

**Fansly Appeal:**
- Support ticket via Fansly website
- Response: 1-3 business days

**Other Platforms:**
- Check platform's help center for appeal process

---

**Solution 3: Update Fanz Dash Risk Scoring**

**After removal:**
- Fanz Dash automatically detects removal (monitors external platforms)
- Risk score increased for similar content
- Future similar content may be blocked for that platform (prevents further violations)

**Manual Update:**
1. Dashboard → External Platforms → Removed Content
2. Confirm removal
3. Fanz Dash updates risk model

---

**Solution 4: Don't Re-Upload Same Content**

**If platform removed content:**
- Do NOT re-upload same content (risk permanent ban)
- Edit to comply and upload as new content
- Or upload only to platforms that allow this content type

---

## 2257 Compliance Issues

### Issue: Cannot Upload Collaborative Content - Performer Not Verified

**What Happened:**
- You're trying to upload content featuring another person
- Upload blocked: "All performers must be verified (18 U.S.C. § 2257)"

---

**Cause:**
- Federal law requires proof all performers are 18+
- Performer in your content hasn't verified their age on Fanz Dash

---

**Solution: Add and Verify Performer**

**Step 1: Add Collaborator**
1. Dashboard → Collaborators → Add New
2. Enter performer's name and email
3. Save

**Step 2: Performer Verifies Age**
- They receive email invitation
- Must upload government-issued ID
- Must sign digital model release
- Fanz Dash verifies age (18+)

**Step 3: Upload Content**
- Once performer verified, you can upload
- Select verified performers during upload
- Content cross-referenced with 2257 records

**Timeline:** Performer verification takes 1-24 hours (depending on verification method)

**Related:** [2257 Compliance Guide](./2257-compliance.md)

---

### Issue: 2257 Records Missing or Incomplete

**What Happened:**
- You're your own Custodian of Records
- FBI inspection request or internal audit revealed missing records

---

**Solution 1: Recreate Records Immediately**

**If records lost or never created:**
1. Contact all performers who appear in your content
2. Get copies of their IDs (even if content is years old)
3. Create 2257 records folder:
   - Performer name
   - Date of birth
   - ID copy
   - List of all content they appear in
4. Organize alphabetically

**Can't Locate Performer?**
- Document attempts to reach them (emails, messages, etc.)
- Remove content featuring them (if records cannot be completed)
- Consult with lawyer (serious federal compliance issue)

---

**Solution 2: Use Fanz Dash Custodian Service**

**To prevent future issues:**
1. Sign up: Dashboard → Compliance → 2257 Custodian Service
2. Fee: $20/month or $200/year
3. Fanz Dash maintains records for you
4. We respond to FBI inspections
5. Records always complete and organized

---

**Solution 3: Consult Lawyer**

**If FBI inspection revealed violations:**
- Serious federal compliance issue
- Criminal charges possible
- Consult with attorney specializing in adult entertainment law immediately

**Do NOT ignore FBI notices.**

---

## False Positive Appeals

### Issue: Content Flagged but Doesn't Violate Policy

**Common False Positives:**

1. **"Daddy" in BDSM Context (Not Incest)**
   - AI flagged "daddy" as incest language
   - Actually BDSM Daddy Dom dynamic (allowed)

2. **Young-Looking Adult (Verified 18+)**
   - AI estimated age <18
   - Performer is verified adult (just young-looking)

3. **Cartoon/Anime (No Real People)**
   - AI detected "child-like" features
   - Content is stylized art, not real people

4. **Educational Content**
   - Removed as "explicit"
   - Actually sexual health education (protected)

5. **Background Item**
   - Removed for weapon in background
   - Weapon was decorative, not focus of content

---

**How to Appeal False Positives:**

**Step 1: Identify What Triggered Flag**
- Review notification email or Statement of Reasons
- Determine exact reason for flag (keyword, visual element, etc.)

**Step 2: Prepare Explanation**
- Clearly explain context
- Show why content doesn't actually violate policy
- Provide evidence (verification records, full caption showing context, etc.)

**Step 3: Submit Appeal**
- Reply to notification email or use DSA Internal Complaint system (EU users)
- Include explanation and evidence
- Request manual review by senior staff

**Step 4: Be Patient**
- Appeals require human review (takes 24-48 hours minimum)
- Senior staff reviews with context AI may have missed

**Appeal Example for "Daddy" False Positive:**

```
Subject: Appeal - False Positive: Incest Violation

Hello,

My content (ID: video_xyz789) was removed for "incest language - daddy/daughter" but this is a false positive.

Context:
I use "daddy" in the BDSM Daddy Dom context, which is a common dominant/submissive dynamic. There is NO mention of family relationships, biological or step-family.

Evidence:
1. Full caption: "My Daddy Dom trains me to be a good submissive 🔥 BDSM power exchange"
2. No family terms (father, dad, daughter, family, etc.)
3. I'm 25 years old (verified), clearly adult
4. My content is tagged "BDSM" and "Dom/Sub" (not "Taboo" or "Roleplay")

According to Prohibited Content List, BDSM is allowed. Daddy Dom/little girl (DDlg) is a recognized BDSM subculture distinct from incest.

Request:
Manual review by senior moderator with understanding of BDSM context.

Thank you.
```

---

## Contact Information

### General Support

**Email:** support@fanz.com
**Live Chat:** https://support.fanz.website
**Hours:** 24/7
**Response Time:** 1-4 hours

---

### Age Verification

**Email:** verification@fanz.com
**Response Time:** 24-48 hours
**For:** Verification failures, location issues, ID problems

---

### Compliance Issues

**Email:** compliance@fanz.com
**Response Time:** 24-48 hours
**For:** Policy questions, content flags, account suspensions

---

### Legal / Appeals

**Email:** legal@fanz.com
**Response Time:** 3-7 days
**For:** Permanent bans, serious violations, legal questions

---

### GDPR (EU Users)

**Email:** gdpr@fanz.com
**Response Time:** 30 days (maximum)
**For:** Data access, erasure, rectification requests

---

### DSA Complaints (EU Users)

**Email:** dsa@fanz.com
**Response Time:** 14 days (maximum)
**For:** Content removal appeals, moderation disputes

---

### 2257 Compliance

**Email:** 2257@fanz.com
**Response Time:** 24-48 hours
**For:** Record keeping, collaborator verification, FBI inspection questions

---

### Payment Processing

**Email:** payments@fanz.com
**Response Time:** 3-5 business days
**For:** Payment processor violations, reinstatement requests

---

### Platform Upload Issues

**Email:** platform-uploads@fanz.com
**Response Time:** 24-48 hours
**For:** External platform upload failures, OnlyFans/Fansly issues

---

## Emergency Support

### Urgent Issues

**Phone:** [Emergency Compliance Hotline]
**Hours:** 24/7
**For:**
- CSAM discovered (suspected child exploitation)
- Trafficking suspected
- Immediate safety concerns
- FBI inspection notice
- Account compromise

**Email for Urgent Issues:** urgent@fanz.com (mark subject "URGENT")

---

## Related Articles

### Compliance Guides
- [Compliance Systems Overview](./compliance-overview.md)
- [Age Verification Guide](./age-verification-guide.md)
- [CSAM Detection Guide](./csam-detection-guide.md)
- [Prohibited Content List](./prohibited-content.md)
- [2257 Compliance Guide](./2257-compliance.md)

### User Rights
- [GDPR User Rights](./gdpr-user-rights.md) (EU users)
- [DSA Complaints](./dsa-complaints.md) (EU users)
- [Privacy Policy](../client/src/pages/PrivacyPolicy.tsx)
- [Terms of Service](../client/src/pages/TermsOfService.tsx)

### Creator Resources
- [Creator Guidelines](./creator-guidelines.md)
- [Platform Upload Compliance](./platform-upload-compliance.md)
- [Moderator Handbook](./moderator-handbook.md)

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz Legal & Compliance Team
**Next Review:** February 2025

---

**Support Commitment:** Fanz Dash is committed to helping you resolve compliance issues quickly and fairly. If you're unsure about anything, contact support BEFORE uploading content. It's easier to prevent issues than fix them after the fact.

**Transparency:** All enforcement actions include clear reasoning and appeal rights. We strive for fair, consistent moderation. If you believe a decision was incorrect, please appeal - we take every appeal seriously.
