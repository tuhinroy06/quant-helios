import { useState } from "react";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  factorId: string;
  challengeId: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification = ({ factorId, challengeId, onSuccess, onBack }: OTPVerificationProps) => {
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: otpCode,
      });

      if (error) throw error;

      toast.success("Verification successful!");
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid verification code";
      toast.error(message);
      setOtpCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h2 className="font-display text-xl text-foreground">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* OTP Input */}
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

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={verifying || otpCode.length !== 6}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-full font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>

        <button
          onClick={onBack}
          disabled={verifying}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Use a different method
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center">
        Open your authenticator app (Google Authenticator, Authy, etc.) to view your verification code.
      </p>
    </div>
  );
};

export default OTPVerification;
