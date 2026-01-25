import { motion } from "framer-motion";
import { Play, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MODULES } from "@/lib/learn-content";
import { Button } from "@/components/ui/button";

interface ContinueLearningProps {
  completedLessons: string[];
}

export const ContinueLearning = ({ completedLessons }: ContinueLearningProps) => {
  const navigate = useNavigate();

  // Find the next incomplete lesson
  const findNextLesson = () => {
    for (const module of MODULES) {
      for (const lesson of module.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { module, lesson };
        }
      }
    }
    return null;
  };

  const next = findNextLesson();

  if (!next) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Congratulations!</h3>
            <p className="text-sm text-muted-foreground">
              You've completed all lessons. Keep practicing with paper trading!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-card/50 border border-border rounded-xl p-6"
    >
      <h3 className="text-foreground font-medium mb-4">Continue Learning</h3>
      
      <button
        onClick={() => navigate(`/dashboard/learn/${next.module.id}/${next.lesson.id}`)}
        className="group w-full p-4 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Play className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm text-muted-foreground">{next.module.title}</p>
          <p className="text-foreground font-medium truncate">{next.lesson.title}</p>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{next.lesson.duration}</span>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
      </button>
    </motion.div>
  );
};
