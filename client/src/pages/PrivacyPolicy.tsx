import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Shield, Globe, Database, Lock, Eye, Mail, Scale } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          Fanz Dash - Effective Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Privacy Matters:</strong> This policy explains how we collect,
          use, protect, and retain your personal data in compliance with GDPR, CCPA,
          and other privacy regulations.
        </AlertDescription>
      </Alert>

      {/* GDPR Compliance Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            EU GDPR Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For users in the European Union, we comply with the General Data
            Protection Regulation (GDPR). You have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>
              <strong>Right of Access (Article 15):</strong> Request a copy of all
              personal data we hold about you
            </li>
            <li>
              <strong>Right to Erasure (Article 17):</strong> Request deletion of
              your personal data ("right to be forgotten")
            </li>
            <li>
              <strong>Right to Rectification (Article 16):</strong> Correct
              inaccurate personal data
            </li>
            <li>
              <strong>Right to Data Portability (Article 20):</strong> Receive your
              data in a machine-readable format
            </li>
            <li>
              <strong>Right to Object (Article 21):</strong> Object to processing of
              your personal data
            </li>
          </ul>
          <p className="text-sm">
            To exercise these rights, contact:{" "}
            <a
              href="mailto:privacy@fanz.com"
              className="text-primary hover:underline"
            >
              privacy@fanz.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Data We Collect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            1. Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Account Information</h3>
            <p className="text-sm text-muted-foreground">
              Email address, username, password (encrypted), profile information,
              payment details
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Age Verification Data</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Data Minimization (GDPR Article 5):</strong> We only store the
              verification result (verified/not verified), date, and jurisdiction.
              We do NOT store copies of ID documents. Verification is performed by
              third-party providers (VerifyMy.io) and retained for 7 years as
              required by 18 U.S.C. § 2257.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Content & Usage Data</h3>
            <p className="text-sm text-muted-foreground">
              Content you upload, messages you send, pages you visit, features you
              use, device information, IP address
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Geolocation Data</h3>
            <p className="text-sm text-muted-foreground">
              IP-based geolocation to determine jurisdiction for age verification
              requirements (UK Online Safety Act, US state laws, EU regulations)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            2. How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Lawful Basis for Processing (GDPR Article 6)</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Contract Performance:</strong> To provide our services and
                fulfill our agreement with you
              </li>
              <li>
                <strong>Legal Obligation:</strong> Age verification, CSAM detection
                and reporting, compliance with court orders
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Fraud prevention, security,
                analytics, service improvement
              </li>
              <li>
                <strong>Consent:</strong> Marketing communications, optional features
                (you can withdraw consent anytime)
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Automated Decision-Making</h3>
            <p className="text-sm text-muted-foreground">
              We use automated systems for content moderation, CSAM detection, and
              payment processor compliance. These systems may block content or
              suspend accounts. You have the right to human review of automated
              decisions under GDPR Article 22.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            3. Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We retain personal data as long as necessary for the purposes outlined
            in this policy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Account Data:</strong> Until you delete your account, then 90
              days for backup recovery
            </li>
            <li>
              <strong>Age Verification Records:</strong> 7 years minimum (required
              by 18 U.S.C. § 2257)
            </li>
            <li>
              <strong>Content Moderation Logs:</strong> 3 years for legal compliance
              and dispute resolution
            </li>
            <li>
              <strong>Financial Records:</strong> 7 years for tax and accounting
              purposes
            </li>
            <li>
              <strong>CSAM Reports:</strong> Indefinitely for law enforcement (as
              required by federal law)
            </li>
          </ul>
          <Alert className="mt-4">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Right to Erasure Exception:</strong> Under GDPR Article 17(3),
              we must retain certain data when legally required (age verification,
              CSAM reports, pending legal claims) even if you request deletion.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            4. Data Sharing & Third Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We share your data with the following third parties:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>VerifyMy.io:</strong> Age verification service (GDPR-compliant,
              data processing agreement in place)
            </li>
            <li>
              <strong>Payment Processors:</strong> Stripe, PayPal for transaction
              processing
            </li>
            <li>
              <strong>Cloud Infrastructure:</strong> AWS, Google Cloud for hosting
            </li>
            <li>
              <strong>Law Enforcement:</strong> NCMEC (CSAM reports), FBI
              (trafficking), state attorneys general (legal obligations)
            </li>
            <li>
              <strong>Analytics:</strong> Anonymized usage data for service
              improvement
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>International Transfers:</strong> We use EU Standard Contractual
            Clauses (SCCs) for data transfers outside the EU, as required by GDPR
            Article 46.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            5. Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We implement industry-standard security measures:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Multi-factor authentication (MFA) available</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and audit logging</li>
            <li>
              72-hour breach notification (GDPR Article 33) to authorities and
              affected users
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            6. Your Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To exercise your privacy rights or file a complaint:
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:privacy@fanz.com"
                className="text-primary hover:underline"
              >
                privacy@fanz.com
              </a>
            </p>
            <p>
              <strong>Privacy Portal:</strong> /account/privacy (when logged in)
            </p>
            <p>
              <strong>Response Time:</strong> 30 days (GDPR) / 45 days (CCPA)
            </p>
            <p>
              <strong>EU Data Protection Authority:</strong> You have the right to
              lodge a complaint with your local DPA if you believe we've violated
              GDPR
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      <Card>
        <CardHeader>
          <CardTitle>7. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our service is strictly for adults 18+. We do not knowingly collect data
            from minors. If we discover a minor has created an account, we will
            immediately terminate the account and delete all associated data. Age
            verification is mandatory in jurisdictions requiring it (UK, US states,
            EU).
          </p>
        </CardContent>
      </Card>

      {/* Changes */}
      <Card>
        <CardHeader>
          <CardTitle>8. Policy Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We may update this policy periodically. Material changes will be notified
            via email or prominent notice on our platform. Continued use after
            changes constitutes acceptance.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Data Protection Officer:</strong> dpo@fanz.com
          </p>
          <p className="text-sm">
            <strong>Privacy Inquiries:</strong> privacy@fanz.com
          </p>
          <p className="text-sm">
            <strong>Legal Department:</strong> legal@fanz.com
          </p>
          <p className="text-sm">
            <strong>Mailing Address:</strong>
            <br />
            Fanz Unlimited Network LLC
            <br />
            Privacy Department
            <br />
            [Your Address]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
