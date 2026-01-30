import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { QuizComponent } from "./QuizComponent";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { MODULES, getLesson, getAdjacentLessons, LessonContent } from "@/lib/learn-content";
import { cn } from "@/lib/utils";

export const LessonViewer = () => {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { markComplete, saveQuizScore, updateTimeSpent, isLessonCompleted } = useLessonProgress();

  const module = MODULES.find(m => m.id === moduleId);
  const lesson = getLesson(moduleId || "", lessonId || "");
  const { prev, next } = getAdjacentLessons(moduleId || "", lessonId || "");
  
  const isCompleted = isLessonCompleted(lessonId || "");

  // Track time spent on lesson - using ref to avoid dependency on mutation object
  useEffect(() => {
    const currentModuleId = moduleId;
    const currentLessonId = lessonId;
    const sessionStart = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - sessionStart) / 1000);
      if (timeSpent > 5 && currentModuleId && currentLessonId) {
        // Fire and forget - don't depend on updateTimeSpent in deps array
        updateTimeSpent.mutate({ lessonId: currentLessonId, moduleId: currentModuleId, seconds: timeSpent });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, lessonId]);

  if (!module || !lesson) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-muted-foreground">Lesson not found</p>
          <Button onClick={() => navigate("/dashboard/learn")} className="mt-4">
            Back to Learn
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleMarkComplete = () => {
    if (moduleId && lessonId) {
      markComplete.mutate({ lessonId, moduleId });
    }
  };

  const handleQuizComplete = (score: number) => {
    if (moduleId && lessonId) {
      saveQuizScore.mutate({ lessonId, moduleId, score });
      if (score >= 70) {
        markComplete.mutate({ lessonId, moduleId });
      }
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n\n').map((paragraph, i) => {
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-medium text-foreground mt-8 mb-4">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-medium text-foreground mt-6 mb-3">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
            {items.map((item, j) => (
              <li key={j}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      if (paragraph.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-4 border-primary pl-4 my-4 text-muted-foreground italic">
            {paragraph.replace('> ', '')}
          </blockquote>
        );
      }
      // Bold text
      const formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>');
      return (
        <p 
          key={i} 
          className="text-muted-foreground leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  // Convert quiz format from learn-content to QuizComponent format
  const convertQuiz = (quiz: LessonContent['quiz']) => {
    return quiz.map(q => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctAnswer,
      explanation: q.explanation,
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/dashboard/learn")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learn
          </button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BookOpen className="w-4 h-4" />
            <span>{module.title}</span>
          </div>

          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            {lesson.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{lesson.duration}</span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-1 mb-8">
          <div
            className="bg-primary h-1 rounded-full transition-all"
            style={{ 
              width: `${((module.lessons.findIndex(l => l.id === lessonId) + 1) / module.lessons.length) * 100}%` 
            }}
          />
        </div>

        {/* Content */}
        {!showQuiz ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert max-w-none"
          >
            {/* Introduction */}
            <div className="bg-card/50 border border-border rounded-xl p-6 mb-8">
              <p className="text-foreground text-lg leading-relaxed">
                {lesson.introduction}
              </p>
            </div>

            {/* Sections */}
            {lesson.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-medium text-foreground mb-4">{section.heading}</h2>
                {renderContent(section.body)}
                
                {section.tip && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
                    <p className="text-sm text-blue-400">💡 <strong>Tip:</strong> {section.tip}</p>
                  </div>
                )}
                
                {section.warning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 my-4">
                    <p className="text-sm text-amber-400">⚠️ <strong>Warning:</strong> {section.warning}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Key Takeaways */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Key Takeaways</h3>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <div>
                {prev && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/dashboard/learn/${moduleId}/${prev.id}`)}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isCompleted && lesson.quiz.length === 0 && (
                  <Button onClick={handleMarkComplete} variant="outline">
                    Mark as Complete
                  </Button>
                )}
                
                {lesson.quiz.length > 0 && (
                  <Button onClick={() => setShowQuiz(true)}>
                    Take Quiz
                  </Button>
                )}

                {next && lesson.quiz.length === 0 && (
                  <Button onClick={() => navigate(`/dashboard/learn/${moduleId}/${next.id}`)} className="gap-2">
                    Next Lesson
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QuizComponent
              questions={convertQuiz(lesson.quiz)}
              onComplete={handleQuizComplete}
              lessonTitle={lesson.title}
            />
            
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setShowQuiz(false)}>
                Back to Lesson
              </Button>
              
              {next && (
                <Button onClick={() => navigate(`/dashboard/learn/${moduleId}/${next.id}`)} className="gap-2">
                  Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonViewer;
