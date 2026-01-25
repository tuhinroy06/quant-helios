import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProgressTracker } from "@/components/learn/ProgressTracker";
import { ContinueLearning } from "@/components/learn/ContinueLearning";
import { CourseCard } from "@/components/learn/CourseCard";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { MODULES } from "@/lib/learn-content";
import { Skeleton } from "@/components/ui/skeleton";

const LearnDashboard = () => {
  const { progress, isLoading, getOverallStats } = useLessonProgress();
  
  const completedLessons = progress?.filter(p => p.completed).map(p => p.lesson_id) ?? [];
  const stats = getOverallStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Learn & Understand
          </h1>
          <p className="text-muted-foreground mb-8">
            Master algorithmic trading with our comprehensive curriculum designed for Indian markets.
          </p>

          {/* Progress Overview */}
          <ProgressTracker
            lessonsCompleted={stats.lessonsCompleted}
            totalTimeSeconds={stats.totalTimeSeconds}
            quizzesCompleted={stats.quizzesCompleted}
            avgQuizScore={stats.avgQuizScore}
          />

          {/* Continue Learning */}
          <div className="mt-6">
            <ContinueLearning completedLessons={completedLessons} />
          </div>

          {/* Courses */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Courses</h2>
            <div className="space-y-4">
              {MODULES.map((module) => (
                <CourseCard
                  key={module.id}
                  module={module}
                  completedLessons={completedLessons}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LearnDashboard;
