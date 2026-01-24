import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailSchema, passwordSchema, calculatePasswordStrength } from "@/lib/auth-validation";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import OTPVerification from "@/components/auth/OTPVerification";

type AuthStep = "credentials" | "mfa";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    // Only validate password strictly on signup
    if (!isLogin) {
      const result = passwordSchema.safeParse(value);
      if (!result.success) {
        setPasswordError(result.error.errors[0].message);
        return false;
      }
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = isLogin ? password.length >= 6 : validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      if (!isPasswordValid && isLogin) {
        setPasswordError("Password must be at least 6 characters");
      }
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Check if MFA is required
          if (error.message.includes("mfa")) {
            // Get MFA factors
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            if (factorsData?.totp && factorsData.totp.length > 0) {
              const factor = factorsData.totp[0];
              const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: factor.id,
              });
              
              if (challengeError) throw challengeError;
              
              setMfaFactorId(factor.id);
              setMfaChallengeId(challengeData.id);
              setAuthStep("mfa");
              setLoading(false);
              return;
            }
          }
          throw error;
        }
        
        navigate("/dashboard/overview");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: displayName,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created successfully!");
        navigate("/dashboard/onboarding");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMFASuccess = () => {
    navigate("/dashboard/overview");
  };

  const handleMFABack = () => {
    setAuthStep("credentials");
    setMfaFactorId("");
    setMfaChallengeId("");
  };

  const passwordStrength = calculatePasswordStrength(password);

  // MFA Verification Step
  if (authStep === "mfa") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-500/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-warm-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10 bg-card/50 border border-border rounded-2xl p-8"
        >
          <OTPVerification
            factorId={mfaFactorId}
            challengeId={mfaChallengeId}
            onSuccess={handleMFASuccess}
            onBack={handleMFABack}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-warm-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        {/* Logo */}
        <h1 className="font-display text-xl font-normal text-muted-foreground mb-8">
          AlgoTrade Pro
        </h1>

        {/* Heading */}
        <h2 className="font-display text-display-md text-foreground mb-3">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className="text-body-md text-muted-foreground mb-8">
          {isLogin 
            ? "Sign in to access your strategies."
            : "Start your journey to smarter trading."}
        </p>

        {/* Trust badge */}
        <div className="bg-card/50 border border-border rounded-xl p-4 mb-8">
          <p className="text-muted-foreground text-sm flex items-center gap-3">
            <Shield className="w-5 h-5 text-warm-500 flex-shrink-0" />
            <span>No real trades without your explicit permission. Start with paper trading.</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-card/50 border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all"
              />
            </motion.div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              className={`w-full bg-card/50 border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all ${
                emailError ? "border-destructive" : "border-border"
              }`}
              required
            />
            {emailError && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>
          
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                className={`w-full bg-card/50 border rounded-xl px-5 py-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all ${
                  passwordError ? "border-destructive" : "border-border"
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {passwordError}
              </p>
            )}
            {!isLogin && <PasswordStrengthIndicator password={password} />}
          </div>

          <button
            type="submit"
            disabled={loading || (!isLogin && passwordStrength.score < 5)}
            className="group w-full flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full text-base font-medium hover:bg-foreground/90 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-muted-foreground mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setEmailError("");
              setPasswordError("");
            }}
            className="text-foreground hover:text-warm-500 transition-colors font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
