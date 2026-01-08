import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-radial-center" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.015] rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Progress indicator - glowing bar style */}
        <div className="flex items-center gap-3 mb-12">
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-primary glow-white" : "bg-border"}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary glow-white" : "bg-border"}`} />
        </div>

        {/* Logo */}
        <h1 className="font-display text-xl font-light text-muted-foreground mb-8">
          AlgoTrade Pro
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-light text-foreground leading-[0.95] mb-4">
                What's your experience level?
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                We'll customize your experience based on your background.
              </p>

              <div className="space-y-3">
                {experienceLevels.map((level, index) => (
                  <motion.button
                    key={level.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setExperienceLevel(level.value)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                      experienceLevel === level.value
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-card/50 border-border hover:border-border/60 hover:bg-card/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-foreground font-medium mb-1">{level.title}</h3>
                        <p className="text-muted-foreground text-sm">{level.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                        experienceLevel === level.value ? "text-foreground translate-x-0" : "text-muted-foreground -translate-x-1 opacity-0"
                      }`} />
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!experienceLevel}
                className="group w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-primary/90 transition-all mt-10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-light text-foreground leading-[0.95] mb-4">
                How would you like to create strategies?
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                You can switch between these modes anytime.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {creationModes.map((mode, index) => (
                  <motion.button
                    key={mode.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setCreationMode(mode.value)}
                    className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                      creationMode === mode.value
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-card/50 border-border hover:border-border/60 hover:bg-card/80"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      creationMode === mode.value ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <mode.icon className={`w-6 h-6 ${
                        creationMode === mode.value ? "text-foreground" : "text-muted-foreground"
                      }`} />
                    </div>
                    <h3 className="text-foreground font-medium mb-1">{mode.title}</h3>
                    <p className="text-muted-foreground text-sm">{mode.description}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3 mt-10">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!creationMode || loading}
                  className="group flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    <>
                      Start Building
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
