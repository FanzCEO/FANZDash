/**
 * Age Verification Modal Component
 * Uses VerifyMy service for age verification
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  VERIFYMYAGE_CONFIG,
  VerificationState,
  isVerificationValid,
  getStoredVerificationState,
  storeVerificationState,
  createVerificationState
} from '@/config/verifymyage';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onClose?: () => void;
  allowClose?: boolean;
}

type VerificationStep = 'intro' | 'methods' | 'verifying' | 'success' | 'failed';

export function AgeVerificationModal({
  isOpen,
  onVerified,
  onClose,
  allowClose = false
}: AgeVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Check for existing verification on mount
  useEffect(() => {
    const existingState = getStoredVerificationState();
    if (isVerificationValid(existingState)) {
      onVerified();
    }
  }, [onVerified]);

  // Handle OAuth callback messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'VERIFYMYAGE_CALLBACK') {
        const { success, code, error: callbackError } = event.data;

        if (success && code) {
          handleVerificationComplete(code);
        } else {
          setError(callbackError || 'Verification failed');
          setStep('failed');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Start verification process with VerifyMy
  const startVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our backend to initiate VerifyMy auth
      const response = await fetch('/api/verifymyage/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: VERIFYMYAGE_CONFIG.redirectUri,
          scopes: VERIFYMYAGE_CONFIG.scopes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start verification');
      }

      const data = await response.json();

      if (data.authUrl) {
        setVerificationUrl(data.authUrl);
        setStep('verifying');

        // Open VerifyMy in a popup window
        const popup = window.open(
          data.authUrl,
          'VerifyMyAge',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Poll for popup close (fallback if postMessage fails)
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollTimer);
            // Check if we got verified via localStorage update
            const state = getStoredVerificationState();
            if (isVerificationValid(state)) {
              setStep('success');
              setTimeout(onVerified, 1500);
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error('Verification start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completion after OAuth callback
  const handleVerificationComplete = async (code: string) => {
    setIsLoading(true);
    setStep('verifying');

    try {
      // Exchange code for verification status
      const response = await fetch('/api/verifymyage/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Verification exchange failed');
      }

      const data = await response.json();

      if (data.verified) {
        const newState = createVerificationState(true);
        storeVerificationState(newState);
        setStep('success');
        setTimeout(onVerified, 1500);
      } else {
        setError(data.reason || 'Age verification failed');
        setStep('failed');
      }
    } catch (err) {
      console.error('Verification complete error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple date of birth verification (fallback method)
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');

  const handleDobVerification = () => {
    const birthDate = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= VERIFYMYAGE_CONFIG.minimumAge) {
      const newState = createVerificationState(true);
      storeVerificationState(newState);
      setStep('success');
      setTimeout(onVerified, 1500);
    } else {
      setError('You must be 18 or older to access this content');
      setStep('failed');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
                <Shield className="w-12 h-12 text-red-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Adult Content Warning</h3>
              <p className="text-gray-400 text-sm">
                This website contains age-restricted material. You must be 18 years or older to enter.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-yellow-400 mb-1">Legal Notice</p>
                  <p>By entering, you confirm that you are at least 18 years old and that viewing adult content is legal in your jurisdiction.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setStep('methods')}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold py-6"
              >
                <Lock className="w-5 h-5 mr-2" />
                I am 18 or older - Continue
              </Button>

              {allowClose && onClose && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Leave Site
                </Button>
              )}
            </div>
          </div>
        );

      case 'methods':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Choose Verification Method</h3>
              <p className="text-gray-400 text-sm">
                Select how you'd like to verify your age
              </p>
            </div>

            <div className="space-y-3">
              {/* VerifyMy - Primary Method */}
              <button
                onClick={startVerification}
                disabled={isLoading}
                className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Verify with VerifyMy</p>
                      <p className="text-xs text-gray-400">Secure ID verification service</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Recommended
                  </Badge>
                </div>
              </button>

              {/* Date of Birth - Fallback */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Enter Date of Birth</p>
                    <p className="text-xs text-gray-400">Quick verification</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Month</label>
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-white text-sm"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Day</label>
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-white text-sm"
                    >
                      <option value="">DD</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Year</label>
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-white text-sm"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleDobVerification}
                  disabled={!dobYear || !dobMonth || !dobDay}
                  className="w-full bg-gray-700 hover:bg-gray-600"
                  size="sm"
                >
                  Verify Age
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('intro')}
              className="w-full text-gray-400 hover:text-white"
            >
              ← Back
            </Button>
          </div>
        );

      case 'verifying':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Verifying Your Age</h3>
              <p className="text-gray-400 text-sm">
                Please complete the verification in the popup window...
              </p>
            </div>

            {verificationUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(verificationUrl, 'VerifyMyAge', 'width=600,height=700')}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Reopen Verification Window
              </Button>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Age Verified!</h3>
              <p className="text-gray-400 text-sm">
                Welcome! You now have access to all content.
              </p>
            </div>

            <div className="flex justify-center">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified 18+
              </Badge>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Verification Failed</h3>
              <p className="text-gray-400 text-sm">
                {error || 'Unable to verify your age. Please try again.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setError(null);
                  setStep('methods');
                }}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Try Again
              </Button>

              {allowClose && onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  Leave Site
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="bg-gray-900 border-gray-800 max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => !allowClose && e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Age Verification</DialogTitle>
          <DialogDescription>
            Verify your age to access this content
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Powered by VerifyMy • Privacy Protected</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgeVerificationModal;
