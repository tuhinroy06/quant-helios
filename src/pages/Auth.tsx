import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be connected to Supabase auth later
    console.log(isLogin ? "Login" : "Signup", { email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo */}
        <h1 className="font-display text-2xl font-medium text-foreground mb-2">
          AlgoTrade Pro
        </h1>

        {/* Heading */}
        <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className="text-muted-foreground mb-10">
          {isLogin 
            ? "Sign in to access your strategies and continue building." 
            : "Start your journey to smarter trading."}
        </p>

        {/* Reassurance */}
        <div className="bg-card/50 border border-border rounded-xl p-4 mb-8">
          <p className="text-muted-foreground text-sm">
            🔒 No real trades without your explicit permission. Start with paper trading.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full text-base font-medium hover-lift mt-6"
          >
            {isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-muted-foreground mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-foreground hover:text-accent transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
