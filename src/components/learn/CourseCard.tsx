import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, CheckCircle, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Module, Lesson } from "@/lib/learn-content";

interface CourseCardProps {
  module: Module;
  completedLessons: string[];
}

export const CourseCard = ({ module, completedLessons }: CourseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const completedCount = module.lessons.filter(l => 
    completedLessons.includes(l.id)
  ).length;
  const progress = Math.round((completedCount / module.lessons.length) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Beginner": return "bg-green-500/20 text-green-500";
      case "Intermediate": return "bg-blue-500/20 text-blue-500";
      case "Essential": return "bg-amber-500/20 text-amber-500";
      case "Advanced": return "bg-purple-500/20 text-purple-500";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const getNextLesson = (): Lesson | undefined => {
    return module.lessons.find(l => !completedLessons.includes(l.id));
  };

  const nextLesson = getNextLesson();

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-foreground font-medium">{module.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full", getCategoryColor(module.category))}>
              {module.category}
            </span>
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {completedCount}/{module.lessons.length} lessons
            </span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-2">
              {module.lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isNext = nextLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/learn/${module.id}/${lesson.id}`);
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-3",
                      isNext
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isCompleted
                        ? "bg-green-500/20"
                        : isNext
                        ? "bg-primary/20"
                        : "bg-secondary"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isNext ? (
                        <Play className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCompleted ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {lesson.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{lesson.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
