import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, CheckCircle, Building, Scale } from "lucide-react";

export default function Statement2257() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">18 U.S.C. § 2257 Compliance Statement</h1>
        <p className="text-muted-foreground text-lg">
          Record-Keeping Requirements Compliance Notice
        </p>
        <Badge variant="outline" className="text-sm">
          Required by Federal Law
        </Badge>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Federal Law Compliance:</strong> This statement is required by 18
          U.S.C. § 2257 and 28 C.F.R. § 75 for all producers of sexually explicit
          content. All records are available for inspection by federal authorities.
        </AlertDescription>
      </Alert>

      {/* Legal Requirement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Legal Requirement Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Title 18, United States Code, Section 2257 requires that producers of
            sexually explicit content maintain records demonstrating that all
            performers depicted in such content are 18 years of age or older. This law
            was enacted to combat child exploitation and trafficking.
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold">18 U.S.C. § 2257 states:</p>
            <p className="text-xs text-muted-foreground italic">
              "Whoever produces any book, magazine, periodical, film, videotape,
              digital image, digitally- or computer-manipulated image of an actual
              human being, picture, or other matter which— (1) contains one or more
              visual depictions made after November 1, 1990 of actual sexually
              explicit conduct; and (2) is produced in whole or in part with materials
              which have been mailed or shipped in interstate or foreign commerce, or
              is shipped or transported or is intended for shipment or transportation
              in interstate or foreign commerce; shall create and maintain
              individually identifiable records pertaining to every performer portrayed
              in such a visual depiction."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Producer Statement */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Primary Producer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Custodian of Records - Title 18 U.S.C. § 2257</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Company Name:</p>
              <p className="text-muted-foreground">Fanz Unlimited Network LLC</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Custodian of Records:</p>
              <p className="text-muted-foreground">[Custodian Name]</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Records Location:</p>
              <p className="text-muted-foreground">
                [Your Physical Address]
                <br />
                [City, State, ZIP]
                <br />
                United States
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Contact Information:</p>
              <p className="text-muted-foreground">
                Email: legal@fanz.com
                <br />
                Phone: [Your Phone Number]
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Business Hours for Inspection:</p>
              <p className="text-muted-foreground">
                Monday - Friday, 9:00 AM - 5:00 PM EST
                <br />
                (By appointment only - contact legal@fanz.com 7 days in advance)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Producer */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Producer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Fanz Dash operates as a platform where third-party content creators
            ("Secondary Producers") upload their own content. Each content creator is
            responsible for maintaining their own 2257 records.
          </p>

          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <Shield className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Content Creator Responsibility:</strong> All creators who upload
              sexually explicit content to Fanz Dash are required to maintain 2257
              records for all performers appearing in their content and must provide
              their custodian of records information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* What We Verify */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Age Verification Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Fanz Dash implements multi-layer age verification to comply with 2257
            requirements and protect against child exploitation:
          </p>

          <div className="space-y-3">
            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Badge className="bg-blue-500">Step 1</Badge>
                Content Creator Verification
              </h4>
              <p className="text-xs text-muted-foreground">
                All creators must verify their identity and age before uploading
                content. Verification includes government-issued ID verification via
                VerifyMy.io or similar services. Creators must be 18+ years old.
              </p>
            </div>

            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Badge className="bg-blue-500">Step 2</Badge>
                Performer Documentation
              </h4>
              <p className="text-xs text-muted-foreground">
                Creators must certify that all performers in their content are 18+ and
                that they maintain proper 2257 records. Creators must provide custodian
                of records information if requested.
              </p>
            </div>

            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Badge className="bg-blue-500">Step 3</Badge>
                Platform Age Verification
              </h4>
              <p className="text-xs text-muted-foreground">
                Content consumers must verify their age before accessing adult content,
                as required by the Online Safety Act 2023 (UK), US state laws, and EU
                regulations.
              </p>
            </div>

            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Badge className="bg-blue-500">Step 4</Badge>
                CSAM Detection
              </h4>
              <p className="text-xs text-muted-foreground">
                All uploaded images are automatically scanned using PhotoDNA hash
                matching against known CSAM databases. Matches are immediately blocked
                and reported to NCMEC per 18 U.S.C. § 2258A.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Keeping */}
      <Card>
        <CardHeader>
          <CardTitle>Record-Keeping Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Per 28 C.F.R. § 75, the following records are maintained for all content:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Performer Information:</strong> Legal name, date of birth, and
              other identifying information for all performers
            </li>
            <li>
              <strong>Identification Documents:</strong> Copies of government-issued
              IDs (driver's license, passport, etc.)
            </li>
            <li>
              <strong>Content Metadata:</strong> Production date, content description,
              performer names
            </li>
            <li>
              <strong>Verification Records:</strong> Age verification results,
              verification dates, verification provider information
            </li>
            <li>
              <strong>Retention Period:</strong> Records are maintained for a minimum
              of 7 years after the content is last displayed or distributed
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Inspection Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection by Authorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Under 18 U.S.C. § 2257(c), the Attorney General (or designee) has the
            right to inspect these records at any time during business hours to ensure
            compliance. Records are organized and indexed as required by regulation.
          </p>
          <Alert className="mt-4">
            <FileText className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>For Law Enforcement:</strong> To request record inspection or
              obtain performer documentation, contact our Custodian of Records at
              legal@fanz.com with at least 7 days advance notice. Inspections must be
              conducted during regular business hours.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Exemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Exempt Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The following categories are exempt from 2257 requirements under 28 C.F.R.
            § 75.1(c):
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Content produced prior to July 3, 1995</li>
            <li>Content that does not depict "actual sexually explicit conduct"</li>
            <li>Content created solely for private use and not for distribution</li>
            <li>
              Content where all performers' faces are not visible and no other
              identifying characteristics are discernible
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Note:</strong> Even if content is technically exempt, Fanz Dash
            requires age verification for all creators and content to maintain platform
            safety and compliance with international laws.
          </p>
        </CardContent>
      </Card>

      {/* Reporting */}
      <Card>
        <CardHeader>
          <CardTitle>Reporting Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you have reason to believe that content on Fanz Dash depicts minors or
            violates 2257 requirements, please report it immediately:
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:abuse@fanz.com" className="text-primary hover:underline">
                abuse@fanz.com
              </a>
            </p>
            <p>
              <strong>NCMEC CyberTipline:</strong>{" "}
              <a
                href="https://report.cybertip.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://report.cybertip.org
              </a>
            </p>
            <p>
              <strong>FBI:</strong>{" "}
              <a
                href="https://tips.fbi.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://tips.fbi.gov
              </a>
            </p>
          </div>
          <Alert variant="destructive" className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Zero Tolerance:</strong> Fanz Dash has zero tolerance for child
              exploitation. All reports are investigated immediately, and suspected
              CSAM is reported to NCMEC within 24 hours as required by federal law.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Statement Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This 2257 statement is reviewed quarterly and updated as needed to reflect
            changes in custodian information, contact details, or record-keeping
            procedures.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Footer Notice */}
      <Alert className="border-primary">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Legal Notice:</strong> This statement is provided in compliance with
          18 U.S.C. § 2257 and 28 C.F.R. § 75. Failure to comply with these
          regulations is a federal crime punishable by up to 5 years imprisonment and
          substantial fines.
        </AlertDescription>
      </Alert>
    </div>
  );
}
