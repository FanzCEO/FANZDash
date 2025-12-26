# AI Knowledge Base Index

**Purpose:** Training data for chatbots, help systems, and AI assistants in the Fanz ecosystem
**Format:** JSON files optimized for RAG (Retrieval-Augmented Generation) and traditional chatbots
**Last Updated:** December 23, 2024

---

## 📚 Overview

The AI Knowledge Base provides structured question-answer pairs, help responses, and error explanations for:

- 🤖 Customer support chatbots
- 💬 In-app help systems
- 🔍 FAQ pages
- 📧 Automated email responses
- 🎯 Context-aware help tooltips

All files use JSON format for easy integration with AI systems, databases, and help desk software.

---

## 📁 File Structure

```
/ai-knowledge/
├── faq-compliance.json (150+ Q&A pairs)
├── faq-age-verification.json (75+ Q&A pairs)
├── faq-prohibited-content.json (100+ Q&A pairs)
├── quick-help-responses.json (200+ short responses)
├── error-messages-explained.json (50+ error codes)
├── compliance-chatbot-training.md (Chatbot behavior guide)
└── prompt-templates.md (GPT/Claude prompt templates)
```

---

## 1. faq-compliance.json

**Status:** ✅ Ready to Generate
**Size:** ~150 question-answer pairs
**Topics:** General compliance, legal requirements, platform policies

### Format

```json
{
  "version": "1.0",
  "last_updated": "2024-12-23",
  "category": "compliance",
  "total_questions": 150,
  "questions": [
    {
      "id": "comp_001",
      "question": "What is compliance and why does it matter?",
      "answer": "Compliance means following laws and regulations that apply to adult content platforms. It matters because non-compliance can result in platform shutdown, criminal charges (up to 20 years imprisonment for CSAM violations), multi-million dollar fines (£18M in UK, €20M in EU), and payment processor termination. Compliance protects users, creators, and the platform.",
      "category": "general",
      "tags": ["compliance", "legal", "basics"],
      "related": ["comp_002", "comp_010", "age_001"],
      "url": "/kb/compliance-overview",
      "difficulty": "beginner",
      "character_count": 342
    },
    {
      "id": "comp_002",
      "question": "What laws does Fanz comply with?",
      "answer": "Fanz complies with 17 jurisdictions: UK Online Safety Act 2023, 8 US state laws (Louisiana, Utah, Virginia, Texas, Arkansas, Mississippi, Montana, Kansas), EU GDPR and DSA, and US federal laws including 18 U.S.C. § 2257 (record keeping), § 2258A (CSAM reporting), and FOSTA-SESTA (trafficking prevention).",
      "category": "general",
      "tags": ["laws", "jurisdiction", "legal"],
      "related": ["comp_001", "comp_003", "age_002"],
      "url": "/kb/compliance-overview#jurisdictions",
      "difficulty": "intermediate",
      "character_count": 387
    }
  ]
}
```

### Sample Questions (20 of 150)

1. What is compliance and why does it matter?
2. What laws does Fanz comply with?
3. What happens if the platform doesn't comply with laws?
4. Do compliance laws apply to me as a user?
5. What are the 7 core compliance systems?
6. What is CSAM and why is it illegal?
7. What is 18 U.S.C. § 2257?
8. What is GDPR?
9. What is the DSA (Digital Services Act)?
10. What is FOSTA-SESTA?
11. Can I be held legally responsible for content I upload?
12. What is the Visa/Mastercard GBPP?
13. How does Fanz protect my privacy?
14. What happens if I violate platform policies?
15. Can I appeal a content removal?
16. What is a "Statement of Reasons"?
17. How long does Fanz keep my data?
18. Can I request my data be deleted?
19. What is a GDPR data subject request?
20. Where can I find Fanz's privacy policy?

**Total:** 150 questions covering all compliance topics

---

## 2. faq-age-verification.json

**Status:** ✅ Ready to Generate
**Size:** ~75 question-answer pairs
**Topics:** Age verification requirements, methods, privacy

### Format

```json
{
  "version": "1.0",
  "last_updated": "2024-12-23",
  "category": "age_verification",
  "total_questions": 75,
  "questions": [
    {
      "id": "age_001",
      "question": "Why do I need to verify my age?",
      "answer": "Age verification is required by law in the UK (Online Safety Act 2023), 8 US states (Louisiana, Utah, Virginia, Texas, Arkansas, Mississippi, Montana, Kansas), and various EU countries. These laws require adult content platforms to verify users are 18+ before granting access. Fanz uses IP geolocation to determine if verification is required based on your location.",
      "category": "requirements",
      "tags": ["age-verification", "legal", "requirements"],
      "related": ["age_002", "age_003", "comp_001"],
      "url": "/kb/age-verification-guide",
      "difficulty": "beginner",
      "character_count": 398
    },
    {
      "id": "age_002",
      "question": "What verification methods are available?",
      "answer": "Fanz offers 4 verification methods: (1) VerifyMy (third-party service, $0.50-$1.50, recommended), (2) ID document upload (free, manual review within 24 hours), (3) Credit card verification (free, instant), and (4) AI age estimation (free, instant, privacy-focused). Choose the method that works best for you.",
      "category": "methods",
      "tags": ["verification-methods", "verifymyage", "id-upload"],
      "related": ["age_003", "age_010", "age_015"],
      "url": "/kb/age-verification-guide#4-verification-methods",
      "difficulty": "beginner",
      "character_count": 396
    }
  ]
}
```

### Sample Questions (20 of 75)

1. Why do I need to verify my age?
2. What verification methods are available?
3. How much does age verification cost?
4. How long does verification take?
5. Which verification method is fastest?
6. Which verification method is most private?
7. What is VerifyMy?
8. Can I use someone else's ID to verify?
9. What happens if my verification fails?
10. Do I need to verify on every device?
11. What data does Fanz store after verification?
12. How long is my verification data stored?
13. Can I delete my verification data?
14. Can I use a VPN during verification?
15. What if I'm not in a jurisdiction that requires verification?
16. Do I need to verify again if I move to a different country?
17. What if I'm verified on one Fanz platform and visit another?
18. What documents are accepted for ID upload?
19. Can I use an expired ID?
20. What if I'm under 18?

**Total:** 75 questions covering age verification

---

## 3. faq-prohibited-content.json

**Status:** ✅ Ready to Generate
**Size:** ~100 question-answer pairs
**Topics:** Prohibited content categories, examples, enforcement

### Format

```json
{
  "version": "1.0",
  "last_updated": "2024-12-23",
  "category": "prohibited_content",
  "total_questions": 100,
  "questions": [
    {
      "id": "prohib_001",
      "question": "What content is prohibited on Fanz?",
      "answer": "9 categories are strictly prohibited: (1) CSAM (child sexual abuse material), (2) Content depicting or appearing to depict minors, (3) Incest (including roleplay), (4) Bestiality, (5) Non-consensual content, (6) Necrophilia, (7) Excrement/bodily waste, (8) Extreme violence/gore, and (9) Human trafficking content. These categories are banned by federal/international law and payment processors (Visa/Mastercard GBPP).",
      "category": "general",
      "tags": ["prohibited-content", "rules", "violations"],
      "related": ["prohib_002", "prohib_010", "comp_006"],
      "url": "/kb/prohibited-content",
      "difficulty": "beginner",
      "character_count": 465
    },
    {
      "id": "prohib_002",
      "question": "Why is incest roleplay prohibited?",
      "answer": "Payment processors (Visa/Mastercard) ban ALL incest content, including roleplay and fantasy scenarios, due to high chargeback rates, reputational risk, and legal concerns in many jurisdictions. Even if all participants are consenting adults 18+, incest-themed content is prohibited. This includes 'step-family' scenarios and any familial relationship references.",
      "category": "specific",
      "tags": ["incest", "roleplay", "payment-processors"],
      "related": ["prohib_003", "prohib_015", "comp_007"],
      "url": "/kb/prohibited-content#3-incest-including-roleplay",
      "difficulty": "intermediate",
      "character_count": 432
    }
  ]
}
```

### Sample Questions (25 of 100)

1. What content is prohibited on Fanz?
2. Why is incest roleplay prohibited?
3. What is "barely legal" content and why is it prohibited?
4. Can I create age play content if everyone is 18+?
5. What is CNC (Consensual Non-Consent) and is it allowed?
6. What is the risk score system?
7. What happens if my content is flagged?
8. Can I appeal a content removal?
9. What is the three-strike system?
10. What happens on my first violation?
11. What happens on my third violation?
12. Can I get permanently banned for one violation?
13. What is CSAM and why is it a federal crime?
14. What are trafficking indicators?
15. Why are school uniforms prohibited in sexual content?
16. Can I use "teen" in my content titles?
17. What types of BDSM content are allowed?
18. Can I create content with animals in it?
19. What is considered "extreme violence"?
20. Can I create scat content?
21. What happens if I post CSAM?
22. What is Visa/Mastercard GBPP?
23. Why do payment processors care about content?
24. Can I post content first and get permission later?
25. How do I know if my content will be approved?

**Total:** 100 questions covering all prohibited categories

---

## 4. quick-help-responses.json

**Status:** ✅ Ready to Generate
**Size:** ~200 short responses
**Topics:** Quick answers for common questions (under 100 characters)

### Format

```json
{
  "version": "1.0",
  "last_updated": "2024-12-23",
  "category": "quick_help",
  "total_responses": 200,
  "responses": [
    {
      "id": "quick_001",
      "trigger": ["how to verify age", "age verification help"],
      "response": "Visit Settings > Age Verification, choose a method (VerifyMy recommended), and complete verification.",
      "character_count": 96,
      "category": "age-verification",
      "related_kb": "/kb/age-verification-guide"
    },
    {
      "id": "quick_002",
      "trigger": ["content flagged", "why was my content blocked"],
      "response": "Check your email for 'Statement of Reasons' explaining why. You can appeal via Compliance Dashboard.",
      "character_count": 98,
      "category": "content-moderation",
      "related_kb": "/kb/troubleshooting-compliance#content-flagged"
    },
    {
      "id": "quick_003",
      "trigger": ["verification cost", "how much does verification cost"],
      "response": "VerifyMy: $0.50-$1.50. ID upload, credit card, and AI estimation are FREE.",
      "character_count": 79,
      "category": "age-verification",
      "related_kb": "/kb/age-verification-guide#4-verification-methods"
    }
  ]
}
```

### Sample Triggers (50 of 200)

1. how to verify age
2. content flagged / blocked
3. verification cost
4. account suspended
5. how to appeal
6. csam report
7. delete my account
8. request my data
9. prohibited content list
10. age verification methods
11. upload failed
12. payment processor violation
13. three strikes
14. what is 2257
15. what is gdpr
16. what is dsa
17. how long data stored
18. can I delete verification
19. vpn verification
20. verification failed
21. id not accepted
22. what documents accepted
23. expired id
24. credit card declined
25. ai estimation failed
26. barely legal allowed
27. incest roleplay allowed
28. school uniform content
29. age play allowed
30. bdsm content allowed
31. trafficking report
32. how to report content
33. statement of reasons
34. appeal deadline
35. moderator review time
36. permanent ban appeal
37. first violation
38. second violation
39. third violation
40. risk score meaning
41. compliance dashboard
42. where is my certificate
43. recertification required
44. course not loading
45. quiz answers
46. failed exam
47. retake exam
48. monetization disabled
49. creator certification
50. moderator certification

**Total:** 200 quick responses

---

## 5. error-messages-explained.json

**Status:** ✅ Ready to Generate
**Size:** ~50 error codes with explanations and solutions
**Topics:** Error messages users encounter, what they mean, how to fix

### Format

```json
{
  "version": "1.0",
  "last_updated": "2024-12-23",
  "category": "errors",
  "total_errors": 50,
  "errors": [
    {
      "error_code": "AGE_VERIFICATION_REQUIRED",
      "error_message": "Age verification required to access this content",
      "explanation": "You're attempting to access age-restricted content but haven't completed age verification. This is required by law in your location.",
      "solution": "Complete age verification by visiting Settings > Age Verification. Choose from 4 methods: VerifyMy ($0.50-$1.50), ID upload (free), credit card (free), or AI estimation (free).",
      "severity": "blocking",
      "category": "age-verification",
      "related_kb": "/kb/age-verification-guide",
      "user_action_required": true
    },
    {
      "error_code": "CONTENT_BLOCKED_CSAM",
      "error_message": "Content blocked - Policy violation detected",
      "explanation": "Your content was flagged by our CSAM detection system (PhotoDNA/PDQ hash matching). This indicates the content matches known CSAM signatures. This violation has been automatically reported to NCMEC and law enforcement as required by federal law (18 U.S.C. § 2258A).",
      "solution": "Your account has been permanently banned. No appeal available. Law enforcement has been notified. Do not attempt to create a new account.",
      "severity": "critical",
      "category": "csam-violation",
      "related_kb": "/kb/prohibited-content#1-child-sexual-abuse-material-csam",
      "user_action_required": false
    },
    {
      "error_code": "CONTENT_RISK_SCORE_HIGH",
      "error_message": "Content blocked - High risk score detected",
      "explanation": "Your content was flagged by our payment processor compliance system with a risk score ≥80/100. This indicates potential violation of Visa/Mastercard prohibited content categories.",
      "solution": "Review your content against our prohibited content list. Remove prohibited elements and try uploading again. You can appeal this decision via Compliance Dashboard if you believe it's a false positive.",
      "severity": "warning",
      "category": "content-moderation",
      "related_kb": "/kb/prohibited-content",
      "user_action_required": true
    }
  ]
}
```

### Sample Error Codes (15 of 50)

1. **AGE_VERIFICATION_REQUIRED** - Age verification needed
2. **AGE_VERIFICATION_FAILED** - Verification attempt failed
3. **AGE_VERIFICATION_PENDING** - Manual review in progress
4. **CONTENT_BLOCKED_CSAM** - CSAM detected
5. **CONTENT_RISK_SCORE_HIGH** - Risk score ≥80
6. **CONTENT_FLAGGED_REVIEW** - Held for moderator review
7. **TRAFFICKING_INDICATORS_DETECTED** - High trafficking risk
8. **ACCOUNT_SUSPENDED_STRIKE_2** - Second strike suspension
9. **ACCOUNT_BANNED_PERMANENT** - Permanent ban
10. **GDPR_REQUEST_PENDING** - Data request processing
11. **GDPR_REQUEST_REJECTED** - Request denied (with reason)
12. **2257_RECORDS_MISSING** - Missing performer records
13. **EXTERNAL_UPLOAD_BLOCKED** - External platform upload failed compliance
14. **PAYMENT_PROCESSOR_VIOLATION** - Payment processor flag
15. **MONETIZATION_DISABLED** - Creator certification required

**Total:** 50 error codes with explanations

---

## 6. compliance-chatbot-training.md

**Status:** ✅ Ready to Generate
**Size:** ~3,000 lines
**Format:** Markdown guide
**Purpose:** Training guide for configuring chatbots to handle compliance questions

### Structure

```markdown
# Compliance Chatbot Training Guide

## 1. Chatbot Personality & Tone

**Personality:**
- Professional but approachable
- Never dismissive of legal concerns
- Empathetic to user frustration
- Clear about legal requirements (not negotiable)
- Helpful in finding solutions

**Tone Guidelines:**
- Use "we" and "our" (team approach)
- Avoid legal jargon when possible
- Explain "why" not just "what"
- Provide specific next steps
- Link to relevant KB articles

**Example Responses:**

❌ Bad: "Age verification is required. Do it now."

✅ Good: "I understand verification can be a hassle! It's required by law in your location (UK Online Safety Act 2023) to ensure only adults access adult content. We've made it easy with 4 options, including free methods. Let me help you choose the best one for you!"

## 2. Handling Sensitive Topics

### CSAM Inquiries

**If user asks about CSAM policies:**
- Explain it's illegal (federal crime)
- Explain zero tolerance
- Explain automatic reporting to NCMEC
- Provide no details about detection methods
- Escalate to human if needed

**Example:**
User: "What happens if CSAM is detected?"

Bot: "CSAM (child sexual abuse material) is a federal crime with zero tolerance. If detected, content is immediately blocked, the account is permanently banned, and the violation is automatically reported to NCMEC (National Center for Missing & Exploited Children) and law enforcement as required by 18 U.S.C. § 2258A. There are no appeals for CSAM violations."

### Trafficking Inquiries

**If user asks about trafficking:**
- Explain we monitor for 13 indicators
- Explain high/critical risk escalation
- Provide National Human Trafficking Hotline: 888-373-7888
- Escalate to human for suspected cases

## 3. Escalation Rules

**Always escalate to human agent if:**
- User threatens harm
- User mentions minors in sexual context
- User reports suspected CSAM
- User reports suspected trafficking
- User asks complex legal questions
- User is distressed or suicidal
- User requests to speak to human

**Escalation Script:**
"I'm going to connect you with a human support agent who can better assist with this situation. Please hold while I transfer you."

## 4. Response Templates by Category

[150+ templates provided]

## 5. Knowledge Base Integration

[How to link chatbot to KB articles]

## 6. Multilingual Support

[Translation guidelines for EU compliance]

## 7. Analytics & Improvement

[How to track chatbot performance]

## 8. Testing & QA

[Test scenarios and expected responses]
```

---

## 7. prompt-templates.md

**Status:** ✅ Ready to Generate
**Size:** ~2,000 lines
**Format:** Markdown with prompt templates
**Purpose:** GPT/Claude prompt templates for various compliance tasks

### Structure

```markdown
# Prompt Templates for AI Systems

## 1. Content Moderation Assistant

### Use Case: Help moderators review flagged content

**Prompt:**
```
You are a content moderation assistant for an adult content platform. Your role is to help human moderators make informed decisions about flagged content.

Context:
- Platform: Fanz (adult content with strict compliance)
- Prohibited categories: CSAM, minors, incest, bestiality, non-consent, necrophilia, excrement, extreme violence, trafficking
- Risk scoring: 0-100 (≥80 = block)
- Enforcement: 3-strike system

Content to Review:
[CONTENT DESCRIPTION]

Risk Score: [SCORE]/100
Flagged Categories: [CATEGORIES]

Task: Analyze this content and provide:
1. Risk assessment (agree with score or suggest adjustment)
2. Prohibited category match (yes/no for each)
3. Enforcement recommendation (allow, warn, block)
4. Reasoning (specific policy violations)
5. False positive likelihood (%)

Guidelines:
- NEVER view actual CSAM - work from descriptions only
- When in doubt, err on side of caution
- Consider context (artistic, educational, etc.)
- Balance false positives vs. compliance risk
```

## 2. GDPR Request Processor

### Use Case: Help process GDPR data subject requests

**Prompt:**
```
You are a GDPR compliance assistant. Your role is to help process data subject requests according to EU GDPR requirements.

Request Details:
Request Type: [ACCESS/ERASURE/RECTIFICATION/PORTABILITY/etc]
Requester: [EMAIL]
Request Text: [USER REQUEST]

Task: Analyze this request and provide:
1. Request type classification (Article 15-22)
2. Validity assessment (is request valid?)
3. Data categories affected (profile, content, messages, etc.)
4. Exceptions applicable (age verification, 2257 records, etc.)
5. Response timeline (30 days from receipt)
6. Recommended action (approve, reject, partial)
7. Response template (draft response to user)

Important Exceptions:
- Age verification records: MUST keep for 7 years (18 U.S.C. § 2257)
- CSAM reports: MUST keep permanently (federal law)
- Financial records: MUST keep for 7 years (tax law)

If rejection recommended, provide clear legal basis.
```

## 3. Trafficking Indicator Detector

### Use Case: Analyze content for trafficking indicators

**Prompt:**
```
You are a trafficking detection assistant. Analyze content for indicators of human trafficking.

13 Trafficking Indicators:
1. Third-party management/control
2. Location changes (multiple cities)
3. Multiple performers, single account
4. Pricing anomalies (suspiciously low)
5. Coercion language
6. Age ambiguity
7. Restricted communication
8. ID document requests
9. Cash-only payments
10. Hotel/motel backgrounds
11. Branding/tattoos (ownership marks)
12. Substance abuse indicators
13. Distress signals

Content to Analyze:
[CONTENT DESCRIPTION]
[METADATA]

Task: Provide:
1. Indicator count (X/13)
2. Which indicators present
3. Risk level (low 0-2, medium 3-5, high 6-8, critical 9+)
4. Recommended action (allow, review, report)
5. Evidence for each indicator

If high/critical risk: Draft FBI report
```

## 4. Age Verification Advisor

**Prompt:**
```
You are an age verification advisor helping users complete verification.

User Location: [COUNTRY/STATE]
Legal Requirement: [YES/NO]
Preferred Method: [UNKNOWN/VERIFYMYAGE/ID_UPLOAD/CREDIT_CARD/AI]

Task: Provide:
1. Is verification required in their location?
2. Which laws apply?
3. Recommended verification method based on:
   - Cost
   - Speed
   - Privacy
   - Reliability
4. Step-by-step instructions for chosen method
5. Troubleshooting common issues
6. Privacy explanation (what data stored)

Be empathetic - many users uncomfortable with verification.
```

## 5. Prohibited Content Classifier

**Prompt:**
```
You are a content classification assistant. Analyze content against 9 prohibited categories.

Categories:
1. CSAM (federal crime)
2. Minors/appearing minor
3. Incest (incl. roleplay)
4. Bestiality
5. Non-consent
6. Necrophilia
7. Excrement/bodily waste
8. Extreme violence/gore
9. Trafficking

Content:
Title: [TITLE]
Description: [DESCRIPTION]
Tags: [TAGS]

Task: For each category, provide:
- Match: YES/NO
- Confidence: 0-100%
- Evidence: Specific text/elements
- Risk score: 0-100 (combine all categories)
- Recommendation: Allow/Warn/Block

Edge cases: Consider context, artistic merit, educational value.
```

[20+ more prompt templates]
```

---

## 🤖 Integration Examples

### OpenAI GPT Integration

```python
import openai

openai.api_key = "your-api-key"

def ask_compliance_chatbot(user_question):
    # Load FAQ knowledge base
    with open('ai-knowledge/faq-compliance.json') as f:
        faq_data = json.load(f)

    # Create context from relevant FAQs
    context = find_relevant_faqs(user_question, faq_data)

    # Query GPT with context
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful compliance chatbot for Fanz. Use the provided FAQ context to answer questions accurately."},
            {"role": "assistant", "content": f"Context: {context}"},
            {"role": "user", "content": user_question}
        ]
    )

    return response.choices[0].message.content
```

### Claude Integration

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

def ask_compliance_assistant(user_question):
    # Load knowledge base
    with open('ai-knowledge/faq-compliance.json') as f:
        faq_data = json.load(f)

    context = find_relevant_faqs(user_question, faq_data)

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system="You are a compliance assistant for Fanz. Answer questions using the provided FAQ context.",
        messages=[
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {user_question}"}
        ]
    )

    return message.content[0].text
```

---

## ✅ Quality Assurance

### Testing Checklist
- [ ] All 575 Q&A pairs reviewed for accuracy
- [ ] All responses under character limits
- [ ] All links to KB articles verified
- [ ] All error codes documented
- [ ] Chatbot personality guidelines tested
- [ ] Prompt templates validated with real AI
- [ ] Multilingual translations accurate
- [ ] Sensitive topics handled appropriately
- [ ] Escalation rules tested

---

## 📊 Usage Analytics

### Track These Metrics
- Most asked questions (optimize answers)
- Unresolved questions (add to FAQs)
- Chatbot escalations (improve responses)
- User satisfaction ratings
- Average resolution time
- Most common error codes

---

## 📞 Support

**Technical Questions:**
- Email: ai-support@fanz.com
- Documentation: /docs/ai-integration

**Content Updates:**
- Email: kb@fanz.com
- Submit via: /admin/kb-editor

---

**Last Updated:** December 23, 2024
**Version:** 1.0
**Maintained by:** Fanz AI & Knowledge Team
**Next Review:** January 2025

---

## 📥 Ready to Generate

All 7 AI knowledge base files are designed and ready to generate:

1. ✅ **faq-compliance.json** - 150 Q&A pairs
2. ✅ **faq-age-verification.json** - 75 Q&A pairs
3. ✅ **faq-prohibited-content.json** - 100 Q&A pairs
4. ✅ **quick-help-responses.json** - 200 short responses
5. ✅ **error-messages-explained.json** - 50 error codes
6. ✅ **compliance-chatbot-training.md** - 3,000 line guide
7. ✅ **prompt-templates.md** - 2,000 line template library

**Total:** 575 Q&A pairs + 200 quick responses + 50 error codes + 2 comprehensive guides

**To Generate:** Specify which files to generate in full detail.
