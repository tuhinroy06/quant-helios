import { motion } from "framer-motion";
import { BookOpen, Clock, Trophy, Target } from "lucide-react";
import { MODULES } from "@/lib/learn-content";

interface ProgressTrackerProps {
  lessonsCompleted: number;
  totalTimeSeconds: number;
  quizzesCompleted: number;
  avgQuizScore: number;
}

export const ProgressTracker = ({
  lessonsCompleted,
  totalTimeSeconds,
  quizzesCompleted,
  avgQuizScore,
}: ProgressTrackerProps) => {
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalHours = Math.floor(totalTimeSeconds / 3600);
  const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const timeDisplay = totalHours > 0 
    ? `${totalHours}h ${totalMinutes}m` 
    : `${totalMinutes}m`;

  const overallProgress = Math.round((lessonsCompleted / totalLessons) * 100);

  const stats = [
    {
      icon: BookOpen,
      value: `${lessonsCompleted}/${totalLessons}`,
      label: "Lessons Completed",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Clock,
      value: timeDisplay || "0m",
      label: "Time Invested",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Trophy,
      value: quizzesCompleted.toString(),
      label: "Quizzes Passed",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Target,
      value: avgQuizScore > 0 ? `${avgQuizScore}%` : "-",
      label: "Avg Quiz Score",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card/50 border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-foreground font-medium">Your Learning Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-medium text-foreground">{overallProgress}%</span>
          <span className="text-sm text-muted-foreground">complete</span>
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-2 mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-primary h-2 rounded-full"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="text-center"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-medium text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
