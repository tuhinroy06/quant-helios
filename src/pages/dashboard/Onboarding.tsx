import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wrench, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ExperienceLevel = "beginner" | "intermediate" | "advanced" | null;
type CreationMode = "ai" | "manual" | null;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const experienceLevels = [
    {
      value: "beginner" as const,
      title: "Just getting started",
      description: "New to algorithmic trading and strategy building",
    },
    {
      value: "intermediate" as const,
      title: "Some experience",
      description: "Familiar with basic trading concepts and indicators",
    },
    {
      value: "advanced" as const,
      title: "Experienced trader",
      description: "Deep knowledge of markets and technical analysis",
    },
  ];

  const creationModes = [
    {
      value: "ai" as const,
      icon: Sparkles,
      title: "AI-Assisted",
      description: "Describe your strategy in plain English and let AI build it",
    },
    {
      value: "manual" as const,
      icon: Wrench,
      title: "Manual Builder",
      description: "Build your strategy step-by-step with our visual editor",
    },
  ];

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: {
            experience_level: experienceLevel,
            preferred_creation_mode: creationMode,
            onboarding_completed: true,
          },
        })
        .eq("user_id", user.id);

      if (error) throw error;
      navigate("/dashboard/overview");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-border"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-border"}`} />
        </div>

        {/* Logo */}
        <h1 className="font-display text-xl font-light text-muted-foreground mb-4">
          AlgoTrade Pro
        </h1>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-3">
              What's your experience level?
            </h2>
            <p className="text-muted-foreground mb-8">
              We'll customize your experience based on your background.
            </p>

            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    experienceLevel === level.value
                      ? "bg-white/5 border-white/30"
                      : "bg-card/50 border-border hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-medium mb-1">{level.title}</h3>
                      <p className="text-muted-foreground text-sm">{level.description}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors ${
                      experienceLevel === level.value ? "text-white" : "text-muted-foreground"
                    }`} />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!experienceLevel}
              className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-3">
              How would you like to create strategies?
            </h2>
            <p className="text-muted-foreground mb-8">
              You can switch between these modes anytime.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {creationModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setCreationMode(mode.value)}
                  className={`text-left p-6 rounded-xl border transition-all ${
                    creationMode === mode.value
                      ? "bg-white/5 border-white/30"
                      : "bg-card/50 border-border hover:border-white/20"
                  }`}
                >
                  <mode.icon className={`w-8 h-8 mb-4 ${
                    creationMode === mode.value ? "text-white" : "text-muted-foreground"
                  }`} />
                  <h3 className="text-foreground font-medium mb-1">{mode.title}</h3>
                  <p className="text-muted-foreground text-sm">{mode.description}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!creationMode || loading}
                className="group flex-1 flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up..." : "Start Building"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
