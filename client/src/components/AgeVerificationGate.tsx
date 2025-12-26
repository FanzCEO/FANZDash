import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  ShieldCheck,
  CreditCard,
  IdCard,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Info,
} from "lucide-react";

interface AgeVerificationGateProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
  jurisdiction?: {
    name: string;
    requiresVerification: boolean;
    verificationMethods: string[];
    minAge: number;
    legalReference: string;
    penaltyAmount?: string;
  };
}

interface VerificationMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  recommended?: boolean;
}

export function AgeVerificationGate({
  isOpen,
  onClose,
  onVerificationComplete,
  jurisdiction,
}: AgeVerificationGateProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");

  // Map verification methods to UI representation
  const getVerificationMethods = (): VerificationMethod[] => {
    const availableMethods = jurisdiction?.verificationMethods || [];

    const allMethods: VerificationMethod[] = [
      {
        id: "third_party_avs",
        name: "VerifyMy Age Verification",
        description:
          "Quick and secure age verification through VerifyMy.io (Recommended)",
        icon: <ShieldCheck className="h-6 w-6" />,
        available: availableMethods.includes("third_party_avs"),
        recommended: true,
      },
      {
        id: "id_document",
        name: "ID Document Upload",
        description: "Upload a government-issued ID for manual verification",
        icon: <IdCard className="h-6 w-6" />,
        available: availableMethods.includes("id_document"),
      },
      {
        id: "credit_card",
        name: "Credit Card Verification",
        description: "Verify age using a credit card (no charge)",
        icon: <CreditCard className="h-6 w-6" />,
        available: availableMethods.includes("credit_card"),
      },
      {
        id: "age_estimation",
        name: "AI Age Estimation",
        description: "Quick age estimation using facial recognition",
        icon: <Shield className="h-6 w-6" />,
        available: availableMethods.includes("age_estimation"),
      },
    ];

    return allMethods.filter((method) => method.available);
  };

  const verificationMethods = getVerificationMethods();

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch("/api/compliance/age-verification/check");
      const data = await response.json();

      if (data.verified) {
        setVerificationStatus("success");
        setTimeout(() => {
          onVerificationComplete();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleVerify = async () => {
    if (!selectedMethod) {
      setError("Please select a verification method");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationStatus("verifying");

    try {
      // Initiate verification
      const response = await fetch(
        "/api/compliance/age-verification/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: selectedMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      if (data.verificationUrl) {
        // Redirect to external verification provider (e.g., VerifyMy)
        window.location.href = data.verificationUrl;
      } else if (data.verified) {
        // Verification complete
        setVerificationStatus("success");
        setTimeout(() => {
          onVerificationComplete();
          onClose();
        }, 1500);
      } else {
        setError("Verification method not yet implemented");
        setVerificationStatus("failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error instanceof Error ? error.message : "Verification failed"
      );
      setVerificationStatus("failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Age Verification Required
              </DialogTitle>
              {jurisdiction && (
                <Badge variant="outline" className="mt-1">
                  {jurisdiction.name}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-base">
            {jurisdiction ? (
              <>
                Due to regulations in {jurisdiction.name}, you must verify that
                you are at least {jurisdiction.minAge} years old to access adult
                content.
              </>
            ) : (
              <>
                You must verify your age before accessing adult content on this
                platform.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Legal Notice */}
        {jurisdiction && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Legal Requirement:</strong> {jurisdiction.legalReference}
              <br />
              {jurisdiction.penaltyAmount && (
                <span className="text-muted-foreground">
                  Platform penalties for non-compliance:{" "}
                  {jurisdiction.penaltyAmount}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {verificationStatus === "success" && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Age verification successful! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && verificationStatus === "failed" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Methods */}
        {verificationStatus !== "success" && (
          <>
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Verification Method
              </h3>

              {verificationMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMethod === method.id
                      ? "border-primary shadow-md"
                      : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedMethod === method.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{method.name}</h4>
                          {method.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Privacy Notice */}
            <Alert className="mt-4">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Privacy Notice:</strong> We only store the verification
                result, not your identification documents. Your data is
                protected and retained in compliance with GDPR and local privacy
                laws.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleVerify}
                disabled={!selectedMethod || isVerifying}
                className="flex-1"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify My Age
                  </>
                )}
              </Button>
            </div>

            {/* Help Link */}
            <div className="text-center mt-4">
              <a
                href="/help/age-verification"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Need help with verification?
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
