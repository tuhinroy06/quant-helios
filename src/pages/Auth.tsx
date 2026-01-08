import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle warm glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-warm-500/[0.05] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        {/* Logo */}
        <h1 className="font-display text-xl font-normal text-gray-400 mb-8">
          AlgoTrade Pro
        </h1>

        {/* Heading */}
        <h2 className="font-display text-display-md text-gray-900 mb-3">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className="text-body-md text-gray-500 mb-8">
          {isLogin 
            ? "Sign in to access your strategies."
            : "Start your journey to smarter trading."}
        </p>

        {/* Trust badge */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
          <p className="text-gray-600 text-sm flex items-center gap-3">
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all"
              />
            </motion.div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-500 transition-all"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-800 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
        <p className="text-center text-gray-500 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-900 hover:text-warm-500 transition-colors font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
