/**
 * COMPREHENSIVE COMPLIANCE DATABASE SCHEMA
 * Tables for legal compliance systems:
 * - Age verification records
 * - CSAM detection reports
 * - Payment processor compliance
 * - GDPR data subject requests
 * - DSA notices and complaints
 * - Trafficking detection
 * - Content moderation workflow
 */

import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users, contentItems } from "./schema";

// ============= AGE VERIFICATION =============

export const ageVerificationRecords = pgTable("age_verification_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),

  // Verification details
  verificationMethod: varchar("verification_method").notNull(), // 'id_document', 'credit_card', 'third_party_avs', 'age_estimation'
  verificationProvider: varchar("verification_provider"), // 'VerifyMy', 'Yoti', 'Veriff', etc.
  verificationSessionId: varchar("verification_session_id"),

  // Result
  verified: boolean("verified").notNull().default(false),
  age: integer("age"),
  dateOfBirth: date("date_of_birth"),

  // Jurisdiction and legal basis
  jurisdiction: varchar("jurisdiction").notNull(), // 'GB', 'US-TX', 'FR', etc.
  legalReference: text("legal_reference"), // e.g., "Online Safety Act 2023"
  lawfulBasis: varchar("lawful_basis").notNull().default('6(1)(c)'), // GDPR Article 6 basis

  // Dates
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // Verification expiry (typically 1 year)

  // GDPR compliance
  dataMinimized: boolean("data_minimized").notNull().default(true), // Only verification result stored, not full ID
  retentionReason: text("retention_reason").notNull().default('Legal compliance - age verification laws'),
  retentionUntil: timestamp("retention_until").notNull(), // 7 years for legal compliance

  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  geolocation: jsonb("geolocation"), // Country, region, city

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============= CSAM DETECTION =============

export const csamDetectionReports = pgTable("csam_detection_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").references(() => contentItems.id),

  // Detection details
  detectionMethod: varchar("detection_method").notNull(), // 'photodna', 'pdq_hash', 'ai_analysis'
  hash: varchar("hash").notNull(),
  matchedHashes: jsonb("matched_hashes").$type<string[]>(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(),
  severity: varchar("severity").notNull(), // 'confirmed_csam', 'suspected_csam', 'clean'

  // Uploader information
  uploaderId: varchar("uploader_id").references(() => users.id),
  uploaderIpAddress: varchar("uploader_ip_address"),
  uploaderInfo: jsonb("uploader_info"),

  // Actions taken
  contentRemoved: boolean("content_removed").notNull().default(false),
  userBanned: boolean("user_banned").notNull().default(false),
  reportedToNCMEC: boolean("reported_to_ncmec").notNull().default(false),
  reportedToIWF: boolean("reported_to_iwf").notNull().default(false),
  ncmecReportId: varchar("ncmec_report_id"),

  // Evidence preservation
  evidencePreserved: boolean("evidence_preserved").notNull().default(false),
  evidenceLocation: text("evidence_location"),

  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'reported', 'investigating', 'closed'

  // Timestamps
  detectedAt: timestamp("detected_at").defaultNow(),
  reportedAt: timestamp("reported_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============= PAYMENT PROCESSOR COMPLIANCE =============

export const paymentProcessorReviews = pgTable("payment_processor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").references(() => contentItems.id).notNull(),

  // Review details
  reviewedBy: varchar("reviewed_by").notNull(), // 'automated', 'human', 'both'
  reviewer: varchar("reviewer"), // User ID of human reviewer

  // Results
  approved: boolean("approved").notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  violations: jsonb("violations").$type<string[]>(),

  // Prohibited content categories
  nonConsent: boolean("non_consent").default(false),
  minorsOrApparent: boolean("minors_or_apparent").default(false),
  incest: boolean("incest").default(false),
  bestiality: boolean("bestiality").default(false),
  rapeOrViolence: boolean("rape_or_violence").default(false),
  intoxication: boolean("intoxication").default(false),
  hypnosisOrSleep: boolean("hypnosis_or_sleep").default(false),
  escortServices: boolean("escort_services").default(false),
  traffickingIndicators: boolean("trafficking_indicators").default(false),

  // Actions
  requiresHumanReview: boolean("requires_human_review").default(false),
  actionTaken: varchar("action_taken"), // 'approved', 'rejected', 'pending_review'
  notes: text("notes"),

  // Timestamps
  reviewedAt: timestamp("reviewed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const paymentProcessorQuarterlyReports = pgTable("payment_processor_quarterly_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Report period
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),

  // Statistics
  totalContent: integer("total_content").notNull(),
  reviewedContent: integer("reviewed_content").notNull(),
  approvedContent: integer("approved_content").notNull(),
  rejectedContent: integer("rejected_content").notNull(),
  prohibitedCategories: jsonb("prohibited_categories"),
  averageReviewTime: decimal("average_review_time", { precision: 10, scale: 2 }), // hours
  humanReviewRate: decimal("human_review_rate", { precision: 5, scale: 2 }), // percentage
  complianceScore: integer("compliance_score"), // 0-100

  // Report generation
  generatedBy: varchar("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow(),
  submittedToProcessor: boolean("submitted_to_processor").default(false),
  submittedAt: timestamp("submitted_at"),

  createdAt: timestamp("created_at").defaultNow()
});

// ============= GDPR DATA PROTECTION =============

export const gdprDataSubjectRequests = pgTable("gdpr_data_subject_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),

  // Request details
  requestType: varchar("request_type").notNull(), // 'access', 'erasure', 'portability', 'rectification', 'restriction', 'object'
  requestDetails: jsonb("request_details"),

  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'rejected'
  responseDeadline: timestamp("response_deadline").notNull(), // 30 days from submission

  // Response
  responseData: jsonb("response_data"),
  rejectionReason: text("rejection_reason"),

  // Processing
  processedBy: varchar("processed_by").references(() => users.id),

  // Timestamps
  submittedAt: timestamp("submitted_at").defaultNow(),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const gdprConsentRecords = pgTable("gdpr_consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),

  // Consent details
  purpose: varchar("purpose").notNull(), // 'marketing', 'analytics', 'data_sharing', etc.
  consentText: text("consent_text").notNull(),
  version: varchar("version").notNull(),

  // GDPR validity requirements (Article 7)
  granted: boolean("granted").notNull(),
  explicit: boolean("explicit").notNull(), // Required for Article 9 special category data
  freelyGiven: boolean("freely_given").notNull(),
  specific: boolean("specific").notNull(),
  informed: boolean("informed").notNull(),
  unambiguous: boolean("unambiguous").notNull(),

  // Dates
  grantedAt: timestamp("granted_at").defaultNow(),
  withdrawnAt: timestamp("withdrawn_at"),
  expiresAt: timestamp("expires_at"),

  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").defaultNow()
});

export const gdprBreachNotifications = pgTable("gdpr_breach_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Breach details
  breachType: varchar("breach_type").notNull(), // 'confidentiality', 'integrity', 'availability'
  severity: varchar("severity").notNull(), // 'low', 'high'
  description: text("description").notNull(),

  // Affected data
  affectedDataSubjects: integer("affected_data_subjects").notNull(),
  dataCategories: jsonb("data_categories").$type<string[]>(),

  // Actions
  mitigationMeasures: jsonb("mitigation_measures").$type<string[]>(),

  // Notifications (Article 33 & 34)
  reportedToAuthority: boolean("reported_to_authority").notNull().default(false),
  reportedToDataSubjects: boolean("reported_to_data_subjects").notNull().default(false),
  supervisoryAuthority: varchar("supervisory_authority"), // 'ICO', 'CNIL', 'DPC', etc.
  authorityNotificationDate: timestamp("authority_notification_date"),
  subjectNotificationDate: timestamp("subject_notification_date"),

  // Timeline
  detectedAt: timestamp("detected_at").notNull(),
  reportedBy: varchar("reported_by").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============= DSA COMPLIANCE =============

export const dsaNotices = pgTable("dsa_notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: varchar("tracking_number").notNull().unique(),

  // Reporter (optional - anonymous allowed)
  reporterId: varchar("reporter_id").references(() => users.id),
  reporterEmail: varchar("reporter_email"),

  // Content being reported
  contentId: varchar("content_id").references(() => contentItems.id).notNull(),
  contentType: varchar("content_type").notNull(), // 'illegal_content', 'tos_violation'
  illegalContentCategory: varchar("illegal_content_category"), // 'csam', 'terrorism', 'hate_speech', 'copyright', 'other'

  // Notice details
  description: text("description").notNull(),
  evidence: jsonb("evidence").$type<string[]>(),

  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'under_review', 'action_taken', 'no_action', 'invalid'
  deadlineDate: timestamp("deadline_date").notNull(),

  // Review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  actionTaken: varchar("action_taken"), // 'content_removed', 'content_restricted', 'user_suspended', 'none'
  statementOfReasonsId: varchar("statement_of_reasons_id"),

  // Timestamps
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const dsaComplaints = pgTable("dsa_complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: varchar("tracking_number").notNull().unique(),

  // Complainant
  userId: varchar("user_id").references(() => users.id).notNull(),

  // Complaint details
  complaintType: varchar("complaint_type").notNull(), // 'content_removal', 'account_suspension', 'content_restriction', 'other_moderation_decision'
  originalDecisionId: varchar("original_decision_id").notNull(),
  originalDecisionDate: timestamp("original_decision_date").notNull(),
  complaintReason: text("complaint_reason").notNull(),
  evidence: jsonb("evidence").$type<string[]>(),

  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'under_review', 'upheld', 'dismissed'
  responseDeadline: timestamp("response_deadline").notNull(),

  // Review (must be different person from original decision maker)
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  outcome: varchar("outcome"), // 'upheld', 'dismissed'

  // Timestamps
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const dsaStatementsOfReasons = pgTable("dsa_statements_of_reasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Decision details
  decisionId: varchar("decision_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  decisionType: varchar("decision_type").notNull(), // 'content_removal', 'account_suspension', 'content_restriction', 'shadowban'

  // Legal and factual grounds (Article 20)
  legalGrounds: text("legal_grounds"),
  tosGrounds: text("tos_grounds"),
  factsAndCircumstances: text("facts_and_circumstances").notNull(),

  // Decision method
  automated: boolean("automated").notNull(),
  humanReview: boolean("human_review").notNull(),

  // Redress information
  appealRights: text("appeal_rights").notNull(),
  redressMechanisms: jsonb("redress_mechanisms").$type<string[]>(),

  // Timestamps
  issuedAt: timestamp("issued_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const dsaTransparencyReports = pgTable("dsa_transparency_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Report period
  year: integer("year").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),

  // Notices (Article 6)
  noticesReceived: integer("notices_received").notNull(),
  noticesByCategory: jsonb("notices_by_category"),
  actionTakenOnNotices: integer("action_taken_on_notices").notNull(),
  averageNoticeProcessingTime: decimal("average_notice_processing_time", { precision: 10, scale: 2 }), // hours

  // Complaints (Article 16)
  complaintsReceived: integer("complaints_received").notNull(),
  complaintsByType: jsonb("complaints_by_type"),
  complaintsUpheld: integer("complaints_upheld").notNull(),
  complaintsDismissed: integer("complaints_dismissed").notNull(),
  averageComplaintResolutionTime: decimal("average_complaint_resolution_time", { precision: 10, scale: 2 }), // days

  // Content moderation
  contentModerationDecisions: integer("content_moderation_decisions").notNull(),
  contentRemoved: integer("content_removed").notNull(),
  accountsSuspended: integer("accounts_suspended").notNull(),
  automatedDecisions: integer("automated_decisions").notNull(),
  humanReviewDecisions: integer("human_review_decisions").notNull(),

  // Business users (creators)
  activeBusinessUsers: integer("active_business_users").notNull(),
  businessUsersSuspended: integer("business_users_suspended").notNull(),

  // CSAM
  csamReportsToAuthorities: integer("csam_reports_to_authorities").notNull(),

  // Report generation
  generatedBy: varchar("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at").defaultNow()
});

// ============= TRAFFICKING DETECTION =============

export const traffickingAssessments = pgTable("trafficking_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Subject of assessment
  userId: varchar("user_id").references(() => users.id),
  contentId: varchar("content_id").references(() => contentItems.id),

  // Assessment results
  riskScore: integer("risk_score").notNull(), // 0-100
  riskLevel: varchar("risk_level").notNull(), // 'low', 'medium', 'high', 'critical'
  indicators: jsonb("indicators").$type<any[]>(),

  // Recommended action
  recommendedAction: varchar("recommended_action").notNull(), // 'none', 'monitor', 'restrict', 'report_to_authorities', 'immediate_shutdown'
  actionTaken: varchar("action_taken"),

  // Assessment details
  reviewedBy: varchar("reviewed_by").notNull(), // 'automated' or user ID
  assessmentMethod: varchar("assessment_method").notNull(), // 'keyword_analysis', 'pattern_matching', 'ai_analysis', 'human_review'

  // Timestamps
  assessmentDate: timestamp("assessment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const traffickingReports = pgTable("trafficking_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Report type
  reportType: varchar("report_type").notNull(), // 'suspected_trafficking', 'prostitution_solicitation', 'coercion_indicators'

  // Subject
  userId: varchar("user_id").references(() => users.id),
  contentId: varchar("content_id").references(() => contentItems.id),
  evidence: jsonb("evidence").$type<string[]>(),
  indicators: jsonb("indicators").$type<any[]>(),
  riskScore: integer("risk_score").notNull(),

  // Reporting
  reportedTo: jsonb("reported_to").$type<string[]>(), // ['FBI', 'NCMEC', 'State_AG', 'Local_LE']
  reportedBy: varchar("reported_by").references(() => users.id).notNull(),
  reportedAt: timestamp("reported_at").defaultNow(),

  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'reported', 'investigating', 'closed'
  investigationNotes: text("investigation_notes"),

  // Evidence preservation
  evidencePreserved: boolean("evidence_preserved").default(false),
  evidenceLocation: text("evidence_location"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Export types
export type AgeVerificationRecord = typeof ageVerificationRecords.$inferSelect;
export type InsertAgeVerificationRecord = typeof ageVerificationRecords.$inferInsert;

export type CSAMDetectionReport = typeof csamDetectionReports.$inferSelect;
export type InsertCSAMDetectionReport = typeof csamDetectionReports.$inferInsert;

export type PaymentProcessorReview = typeof paymentProcessorReviews.$inferSelect;
export type InsertPaymentProcessorReview = typeof paymentProcessorReviews.$inferInsert;

export type GDPRDataSubjectRequest = typeof gdprDataSubjectRequests.$inferSelect;
export type InsertGDPRDataSubjectRequest = typeof gdprDataSubjectRequests.$inferInsert;

export type DSANotice = typeof dsaNotices.$inferSelect;
export type InsertDSANotice = typeof dsaNotices.$inferInsert;

export type DSAComplaint = typeof dsaComplaints.$inferSelect;
export type InsertDSAComplaint = typeof dsaComplaints.$inferInsert;

export type TraffickingAssessment = typeof traffickingAssessments.$inferSelect;
export type InsertTraffickingAssessment = typeof traffickingAssessments.$inferInsert;

export type TraffickingReport = typeof traffickingReports.$inferSelect;
export type InsertTraffickingReport = typeof traffickingReports.$inferInsert;
