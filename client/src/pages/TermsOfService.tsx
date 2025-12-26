import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Shield,
  Ban,
  CreditCard,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">
          Fanz Dash Platform Agreement - Effective Date:{" "}
          {new Date().toLocaleDateString()}
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> By using Fanz Dash, you agree to these terms.
          This is a legally binding agreement. If you do not agree, do not use our
          services.
        </AlertDescription>
      </Alert>

      {/* Age Requirement */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            1. Age Requirement & Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <Ban className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>18+ ONLY:</strong> You must be at least 18 years old to use
              this platform. Minors are strictly prohibited.
            </AlertDescription>
          </Alert>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Age Verification:</strong> Depending on your location, you may
              be required to verify your age before accessing content:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li>
                <strong>United Kingdom:</strong> Required by Online Safety Act 2023
              </li>
              <li>
                <strong>US States:</strong> Louisiana, Utah, Virginia, Texas,
                Arkansas, Mississippi, Montana, Kansas
              </li>
              <li>
                <strong>European Union:</strong> Required by member state
                regulations
              </li>
            </ul>
            <p className="mt-4">
              Verification is performed by third-party providers (VerifyMy.io). We
              only store the verification result, not your ID documents. Records are
              retained for 7 years as required by 18 U.S.C. § 2257.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            2. Prohibited Content & Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            The following content and activities are{" "}
            <strong className="text-red-500">STRICTLY PROHIBITED</strong> and will
            result in immediate account termination and reporting to authorities:
          </p>

          <div className="space-y-3">
            <div className="border border-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
              <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4" />
                Federal Law Violations
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                <li>
                  Child sexual abuse material (CSAM) - reported to NCMEC per 18
                  U.S.C. § 2258A
                </li>
                <li>Minors or individuals appearing to be minors</li>
                <li>Human trafficking or sex trafficking content</li>
                <li>Escort services, prostitution solicitation (FOSTA-SESTA)</li>
              </ul>
            </div>

            <div className="border border-orange-500 p-3 rounded">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Payment Processor Prohibited Content (Visa/Mastercard GBPP)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Non-consensual content (rape, drugged, sleeping, intoxicated)</li>
                <li>Incest (real or simulated)</li>
                <li>Bestiality or zoophilia</li>
                <li>Extreme violence or torture</li>
                <li>Necrophilia</li>
                <li>Feces, vomit, or scat content</li>
                <li>Hypnosis or mind control content</li>
                <li>Content depicting lack of consciousness</li>
              </ul>
            </div>

            <div className="border p-3 rounded">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Ban className="h-4 w-4" />
                Additional Prohibited Activities
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Harassment, hate speech, or threats</li>
                <li>Doxxing or sharing private information without consent</li>
                <li>Fraud, phishing, or financial scams</li>
                <li>Spam or unsolicited advertising</li>
                <li>Malware, viruses, or hacking attempts</li>
                <li>Impersonation of others</li>
                <li>Circumventing age verification or content restrictions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Moderation */}
      <Card>
        <CardHeader>
          <CardTitle>3. Content Moderation & Enforcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We employ automated and human moderation to enforce these terms:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>CSAM Detection:</strong> All images are scanned using PhotoDNA
              hash matching. Matches are immediately blocked and reported to NCMEC,
              IWF, and INHOPE.
            </li>
            <li>
              <strong>Payment Processor Compliance:</strong> Content is automatically
              reviewed for prohibited categories. High-risk content is blocked to
              maintain payment processing capabilities.
            </li>
            <li>
              <strong>Trafficking Detection:</strong> AI monitors messages and content
              for indicators of human trafficking (FOSTA-SESTA compliance).
            </li>
            <li>
              <strong>Human Review:</strong> Flagged content is reviewed by trained
              moderators within 24 hours.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Account Termination */}
      <Card>
        <CardHeader>
          <CardTitle>4. Account Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We reserve the right to suspend or terminate accounts for violations of
            these terms:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="border border-yellow-500 p-3 rounded">
              <Badge className="bg-yellow-500 mb-2">Warning</Badge>
              <p className="text-xs text-muted-foreground">
                First-time minor violations may receive a warning and content removal
              </p>
            </div>
            <div className="border border-orange-500 p-3 rounded">
              <Badge className="bg-orange-500 mb-2">Suspension</Badge>
              <p className="text-xs text-muted-foreground">
                Repeated violations result in temporary account suspension (7-30 days)
              </p>
            </div>
            <div className="border border-red-500 p-3 rounded">
              <Badge variant="destructive" className="mb-2">
                Permanent Ban
              </Badge>
              <p className="text-xs text-muted-foreground">
                Severe violations (CSAM, trafficking, illegal content) result in
                immediate permanent ban and law enforcement reporting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            5. Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Creator Earnings</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Platform commission: 20% of all earnings</li>
              <li>Minimum payout threshold: $50</li>
              <li>Payout schedule: Bi-weekly (NET-7 processing)</li>
              <li>
                Payment methods: Bank transfer, PayPal, cryptocurrency (where
                available)
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Chargebacks & Disputes</h4>
            <p className="text-sm text-muted-foreground">
              Creators are responsible for chargebacks. Excessive chargebacks (&gt;1%)
              may result in account review or suspension. We reserve the right to hold
              funds for disputed transactions.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Tax Compliance</h4>
            <p className="text-sm text-muted-foreground">
              US-based creators must provide W-9 forms. International creators must
              provide W-8BEN forms. 1099-K forms are issued annually for earnings over
              $600 (US tax law).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GDPR & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>6. Privacy & Data Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your privacy is governed by our{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . For EU users, we comply with GDPR. You have rights to access, rectify,
            erase, port, and object to processing of your personal data. Contact{" "}
            <a href="mailto:privacy@fanz.com" className="text-primary hover:underline">
              privacy@fanz.com
            </a>{" "}
            to exercise these rights.
          </p>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card>
        <CardHeader>
          <CardTitle>7. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Your Content</h4>
            <p className="text-sm text-muted-foreground">
              You retain ownership of content you upload. By posting, you grant us a
              worldwide, non-exclusive, royalty-free license to display, distribute,
              and promote your content on our platform.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">DMCA Compliance</h4>
            <p className="text-sm text-muted-foreground">
              We comply with the Digital Millennium Copyright Act (DMCA). To report
              copyright infringement, email{" "}
              <a href="mailto:dmca@fanz.com" className="text-primary hover:underline">
                dmca@fanz.com
              </a>{" "}
              with proof of ownership.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Liability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            8. Limitation of Liability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FANZ DASH IS PROVIDED "AS IS"
            WITHOUT WARRANTIES. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
            OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED $100 OR THE
            AMOUNT YOU PAID US IN THE PAST 12 MONTHS, WHICHEVER IS GREATER.
          </p>
        </CardContent>
      </Card>

      {/* Dispute Resolution */}
      <Card>
        <CardHeader>
          <CardTitle>9. Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Arbitration Agreement</h4>
            <p className="text-sm text-muted-foreground">
              Most disputes will be resolved through binding arbitration rather than
              court litigation. You waive the right to a jury trial and class action
              lawsuits. EU users retain the right to file complaints with their local
              Data Protection Authority.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">DSA Internal Complaints (EU Users)</h4>
            <p className="text-sm text-muted-foreground">
              Under the EU Digital Services Act (DSA), you may file internal complaints
              about moderation decisions. Submit complaints via{" "}
              <a
                href="/api/compliance/dsa/complaint"
                className="text-primary hover:underline"
              >
                our DSA complaint portal
              </a>
              . We will respond within 14 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card>
        <CardHeader>
          <CardTitle>10. Governing Law</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            These terms are governed by the laws of [Your State/Country]. For
            international users, we comply with local regulations including GDPR (EU),
            UK Online Safety Act, CCPA (California), and applicable age verification
            laws.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card>
        <CardHeader>
          <CardTitle>11. Changes to These Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We may update these terms periodically. Material changes will be notified
            30 days in advance via email or platform notice. Continued use after
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
          <CardTitle>Contact & Legal Notices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Legal Department:</strong> legal@fanz.com
          </p>
          <p>
            <strong>DMCA Agent:</strong> dmca@fanz.com
          </p>
          <p>
            <strong>Privacy Officer:</strong> privacy@fanz.com
          </p>
          <p>
            <strong>Law Enforcement:</strong> legal@fanz.com (official requests only)
          </p>
          <p className="pt-2">
            <strong>Mailing Address:</strong>
            <br />
            Fanz Unlimited Network LLC
            <br />
            Legal Department
            <br />
            [Your Address]
          </p>
        </CardContent>
      </Card>

      {/* Acknowledgment */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          By using Fanz Dash, you acknowledge that you have read, understood, and
          agree to be bound by these Terms of Service and our Privacy Policy.
        </AlertDescription>
      </Alert>
    </div>
  );
}
