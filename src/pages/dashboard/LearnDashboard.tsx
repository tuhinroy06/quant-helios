import { motion } from "framer-motion";
import { BookOpen, Play, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  category: string;
}

const LearnDashboard = () => {
  const courses: Course[] = [
    {
      id: "1",
      title: "Getting Started with Algorithmic Trading",
      description: "Learn the fundamentals of algorithmic trading and how to use this platform.",
      category: "Beginner",
      lessons: [
        { id: "1-1", title: "What is Algorithmic Trading?", duration: "5 min", completed: true },
        { id: "1-2", title: "Understanding Market Types", duration: "8 min", completed: true },
        { id: "1-3", title: "Your First Strategy", duration: "12 min", completed: false },
        { id: "1-4", title: "Introduction to Backtesting", duration: "10 min", completed: false },
      ],
    },
    {
      id: "2",
      title: "Technical Indicators Deep Dive",
      description: "Master the most commonly used technical indicators for trading.",
      category: "Intermediate",
      lessons: [
        { id: "2-1", title: "Moving Averages Explained", duration: "15 min", completed: false },
        { id: "2-2", title: "RSI and Momentum", duration: "12 min", completed: false },
        { id: "2-3", title: "MACD Strategy", duration: "18 min", completed: false },
        { id: "2-4", title: "Bollinger Bands", duration: "14 min", completed: false },
        { id: "2-5", title: "Volume Analysis", duration: "10 min", completed: false },
      ],
    },
    {
      id: "3",
      title: "Risk Management Essentials",
      description: "Learn how to protect your capital and manage risk effectively.",
      category: "Essential",
      lessons: [
        { id: "3-1", title: "Position Sizing Basics", duration: "12 min", completed: false },
        { id: "3-2", title: "Stop Loss Strategies", duration: "15 min", completed: false },
        { id: "3-3", title: "Risk-Reward Ratios", duration: "10 min", completed: false },
        { id: "3-4", title: "Portfolio Diversification", duration: "18 min", completed: false },
      ],
    },
    {
      id: "4",
      title: "Futures & Options Basics",
      description: "Introduction to derivatives trading and F&O strategies.",
      category: "Advanced",
      lessons: [
        { id: "4-1", title: "What are Derivatives?", duration: "10 min", completed: false },
        { id: "4-2", title: "Futures Contracts Explained", duration: "15 min", completed: false },
        { id: "4-3", title: "Options: Calls and Puts", duration: "20 min", completed: false },
        { id: "4-4", title: "Understanding Greeks", duration: "25 min", completed: false },
        { id: "4-5", title: "Common Options Strategies", duration: "22 min", completed: false },
        { id: "4-6", title: "Risk in Derivatives", duration: "12 min", completed: false },
        { id: "4-7", title: "Payoff Diagrams", duration: "15 min", completed: false },
        { id: "4-8", title: "Practice: Virtual Trading", duration: "30 min", completed: false },
      ],
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Beginner": return "bg-green-500/20 text-green-500";
      case "Intermediate": return "bg-blue-500/20 text-blue-500";
      case "Essential": return "bg-amber-500/20 text-amber-500";
      case "Advanced": return "bg-purple-500/20 text-purple-500";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const getProgress = (lessons: Lesson[]) => {
    const completed = lessons.filter(l => l.completed).length;
    return Math.round((completed / lessons.length) * 100);
  };

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
            Educational resources to help you become a better trader.
          </p>

          {/* Progress Overview */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-8">
            <h3 className="text-foreground font-medium mb-4">Your Learning Progress</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-medium text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">21</p>
                <p className="text-sm text-muted-foreground">Lessons Remaining</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">~4h</p>
                <p className="text-sm text-muted-foreground">Total Duration</p>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            {courses.map((course) => {
              const progress = getProgress(course.lessons);
              const nextLesson = course.lessons.find(l => !l.completed);

              return (
                <div
                  key={course.id}
                  className="bg-card/50 border border-border rounded-xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-medium">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          {course.lessons.filter(l => l.completed).length}/{course.lessons.length} lessons
                        </span>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-white h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Next Lesson or Completed */}
                    {nextLesson ? (
                      <button className="group flex items-center justify-between w-full p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <Play className="w-5 h-5 text-foreground" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">{nextLesson.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {nextLesson.duration}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">Course Completed!</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Lesson List - Could add accordion here */}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LearnDashboard;
