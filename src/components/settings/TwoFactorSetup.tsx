import { useState, useEffect } from "react";
import { Shield, Copy, Check, Loader2, X, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SetupStep = "intro" | "qr" | "verify" | "success";

const TwoFactorSetup = ({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<SetupStep>("intro");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setStep("intro");
      setQrCode("");
      setSecret("");
      setFactorId("");
      setOtpCode("");
      setCopied(false);
    }
  }, [open]);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("qr");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to set up 2FA";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy secret");
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: otpCode,
      });

      if (error) throw error;

      if (data) {
        setStep("success");
        toast.success("Two-factor authentication enabled!");
        onSuccess?.();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid verification code";
      toast.error(message);
      setOtpCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {step === "success" ? "2FA Enabled!" : "Set Up Two-Factor Authentication"}
          </DialogTitle>
          <DialogDescription>
            {step === "intro" && "Add an extra layer of security to your account using an authenticator app."}
            {step === "qr" && "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)"}
            {step === "verify" && "Enter the 6-digit code from your authenticator app to verify setup."}
            {step === "success" && "Your account is now protected with two-factor authentication."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Intro Step */}
          {step === "intro" && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">You'll need an authenticator app</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Download Google Authenticator, Authy, or any TOTP-compatible app on your phone.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleEnroll}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          )}

          {/* QR Code Step */}
          {step === "qr" && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-3">
                  <code className="flex-1 text-xs text-foreground font-mono break-all">
                    {secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep("verify")}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                I've added the code
              </button>
            </div>
          )}

          {/* Verify Step */}
          {step === "verify" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={verifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("qr")}
                  disabled={verifying}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verifying || otpCode.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll now be asked for a verification code each time you sign in.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorSetup;
