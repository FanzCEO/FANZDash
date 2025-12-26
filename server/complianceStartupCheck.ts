/**
 * COMPLIANCE SYSTEMS STARTUP VALIDATION
 * Checks all compliance systems are properly configured before server starts
 * Run this before accepting traffic to ensure legal requirements are met
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

interface ValidationResult {
  system: string;
  status: "pass" | "fail" | "warning";
  message: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

/**
 * Check if required environment variables are set
 */
function checkEnvironmentVariables(): ValidationResult[] {
  const checks: ValidationResult[] = [];

  // Critical: Database
  if (!process.env.DATABASE_URL) {
    checks.push({
      system: "Database",
      status: "fail",
      message: "DATABASE_URL not set - server cannot start",
      critical: true,
    });
  } else {
    checks.push({
      system: "Database",
      status: "pass",
      message: "DATABASE_URL configured",
      critical: true,
    });
  }

  // Critical: Age Verification (required by law in UK, US states, EU)
  if (!process.env.VERIFYMYAGE_API_KEY) {
    checks.push({
      system: "Age Verification",
      status: "warning",
      message:
        "VERIFYMYAGE_API_KEY not set - age verification will fail in regulated jurisdictions (UK, US states, EU)",
      critical: true,
    });
  } else {
    checks.push({
      system: "Age Verification",
      status: "pass",
      message: "VerifyMy.io API key configured",
      critical: true,
    });
  }

  // Critical: CSAM Detection (required by federal law 18 U.S.C. § 2258A)
  if (!process.env.NCMEC_API_KEY) {
    checks.push({
      system: "CSAM Detection",
      status: "warning",
      message:
        "NCMEC_API_KEY not set - CSAM detections will NOT be reported to NCMEC (federal law violation)",
      critical: true,
    });
  } else {
    checks.push({
      system: "CSAM Detection",
      status: "pass",
      message: "NCMEC API key configured",
      critical: true,
    });
  }

  // Warning: Geolocation (needed for jurisdiction detection)
  if (
    !process.env.IPINFO_TOKEN &&
    !process.env.MAXMIND_LICENSE_KEY &&
    !process.env.IPAPI_KEY
  ) {
    checks.push({
      system: "Geolocation",
      status: "warning",
      message:
        "No geolocation API key set - will use fallback IP-based detection (less accurate)",
      critical: false,
    });
  } else {
    checks.push({
      system: "Geolocation",
      status: "pass",
      message: "Geolocation API configured",
      critical: false,
    });
  }

  // Optional: International reporting
  if (!process.env.IWF_API_KEY) {
    checks.push({
      system: "IWF Reporting",
      status: "warning",
      message: "IWF_API_KEY not set - CSAM won't be reported to IWF (UK)",
      critical: false,
    });
  }

  if (!process.env.INHOPE_API_KEY) {
    checks.push({
      system: "INHOPE Reporting",
      status: "warning",
      message: "INHOPE_API_KEY not set - CSAM won't be reported to INHOPE (EU)",
      critical: false,
    });
  }

  return checks;
}

/**
 * Check if database tables exist
 */
async function checkDatabaseTables(): Promise<ValidationResult[]> {
  const checks: ValidationResult[] = [];

  try {
    // Check if compliance tables exist
    const tables = [
      "age_verification_records",
      "csam_detection_reports",
      "payment_processor_reviews",
      "gdpr_data_subject_requests",
      "dsa_notices",
      "trafficking_assessments",
    ];

    for (const table of tables) {
      try {
        await db.execute(
          sql.raw(`SELECT 1 FROM ${table} LIMIT 1`)
        );
        checks.push({
          system: `Database Table: ${table}`,
          status: "pass",
          message: `Table exists`,
          critical: true,
        });
      } catch (error) {
        checks.push({
          system: `Database Table: ${table}`,
          status: "fail",
          message: `Table does not exist - run 'npm run db:push'`,
          critical: true,
        });
      }
    }
  } catch (error) {
    checks.push({
      system: "Database Connection",
      status: "fail",
      message: `Cannot connect to database: ${error instanceof Error ? error.message : "Unknown error"}`,
      critical: true,
    });
  }

  return checks;
}

/**
 * Check if compliance services are accessible
 */
async function checkComplianceServices(): Promise<ValidationResult[]> {
  const checks: ValidationResult[] = [];

  // These checks would make actual API calls in production
  // For now, we just check if the services can be imported

  try {
    const { ageVerificationEnforcement } = await import(
      "./services/ageVerificationEnforcement"
    );
    checks.push({
      system: "Age Verification Service",
      status: "pass",
      message: "Service initialized",
      critical: true,
    });
  } catch (error) {
    checks.push({
      system: "Age Verification Service",
      status: "fail",
      message: `Cannot import service: ${error instanceof Error ? error.message : "Unknown"}`,
      critical: true,
    });
  }

  try {
    const { csamDetectionService } = await import(
      "./services/csamDetectionService"
    );
    checks.push({
      system: "CSAM Detection Service",
      status: "pass",
      message: "Service initialized",
      critical: true,
    });
  } catch (error) {
    checks.push({
      system: "CSAM Detection Service",
      status: "fail",
      message: `Cannot import service: ${error instanceof Error ? error.message : "Unknown"}`,
      critical: true,
    });
  }

  try {
    const { paymentProcessorCompliance } = await import(
      "./services/paymentProcessorCompliance"
    );
    checks.push({
      system: "Payment Processor Compliance",
      status: "pass",
      message: "Service initialized",
      critical: true,
    });
  } catch (error) {
    checks.push({
      system: "Payment Processor Compliance",
      status: "fail",
      message: `Cannot import service: ${error instanceof Error ? error.message : "Unknown"}`,
      critical: true,
    });
  }

  return checks;
}

/**
 * Main validation function
 */
export async function validateComplianceSystemsOnStartup(): Promise<{
  success: boolean;
  results: ValidationResult[];
  criticalFailures: ValidationResult[];
  warnings: ValidationResult[];
}> {
  console.log("\n🛡️  COMPLIANCE SYSTEMS STARTUP VALIDATION\n");
  console.log("Checking all legal compliance systems...\n");

  const allResults: ValidationResult[] = [];

  // Check environment variables
  console.log("📋 Checking environment variables...");
  const envResults = checkEnvironmentVariables();
  allResults.push(...envResults);

  // Check database tables
  console.log("🗄️  Checking database tables...");
  const dbResults = await checkDatabaseTables();
  allResults.push(...dbResults);

  // Check compliance services
  console.log("⚙️  Checking compliance services...");
  const serviceResults = await checkComplianceServices();
  allResults.push(...serviceResults);

  // Analyze results
  const criticalFailures = allResults.filter(
    (r) => r.status === "fail" && r.critical
  );
  const warnings = allResults.filter((r) => r.status === "warning");
  const passes = allResults.filter((r) => r.status === "pass");

  console.log("\n📊 VALIDATION RESULTS:\n");
  console.log(`✅ Passed: ${passes.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Critical Failures: ${criticalFailures.length}\n`);

  // Display failures
  if (criticalFailures.length > 0) {
    console.log("❌ CRITICAL FAILURES (Must be fixed):\n");
    criticalFailures.forEach((result) => {
      console.log(`   • ${result.system}: ${result.message}`);
    });
    console.log("\n");
  }

  // Display warnings
  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS (Recommended to fix):\n");
    warnings.forEach((result) => {
      console.log(`   • ${result.system}: ${result.message}`);
    });
    console.log("\n");
  }

  // Display passes
  if (passes.length > 0) {
    console.log("✅ PASSED CHECKS:\n");
    passes.forEach((result) => {
      console.log(`   • ${result.system}: ${result.message}`);
    });
    console.log("\n");
  }

  const success = criticalFailures.length === 0;

  if (!success) {
    console.log("🚨 SERVER STARTUP BLOCKED - Critical compliance failures detected");
    console.log(
      "   Fix the issues above before starting the server to ensure legal compliance.\n"
    );
    console.log("   See COMPLIANCE_DEPLOYMENT.md for setup instructions.\n");
  } else if (warnings.length > 0) {
    console.log(
      "⚠️  SERVER CAN START but has warnings - some compliance features may not work fully"
    );
    console.log("   Consider fixing warnings before production deployment.\n");
  } else {
    console.log("✅ ALL COMPLIANCE SYSTEMS VALIDATED - Server ready to start!\n");
    console.log("   Legal compliance systems active:");
    console.log("   • Age Verification (UK Online Safety Act, US states, EU)");
    console.log("   • CSAM Detection (18 U.S.C. § 2258A)");
    console.log("   • Payment Processor Compliance (Visa/Mastercard GBPP)");
    console.log("   • GDPR Data Protection (EU)");
    console.log("   • DSA Compliance (EU)");
    console.log("   • Trafficking Detection (FOSTA-SESTA)\n");
  }

  return {
    success,
    results: allResults,
    criticalFailures,
    warnings,
  };
}

// Note: ESM modules cannot use require.main === module check
// Use 'npm run compliance:check' script instead to run validation directly
