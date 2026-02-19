import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  lessonTitle: string;
}

export const QuizComponent = ({ questions, onComplete, lessonTitle }: QuizComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const currentCorrect = correctAnswers + (isCorrect ? 1 : 0);
      const finalScore = Math.round((currentCorrect / questions.length) * 100);
      setIsComplete(true);
      onComplete(finalScore);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-8 text-center"
      >
        <div className={cn(
          "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
          passed ? "bg-green-500/20" : "bg-amber-500/20"
        )}>
          <Trophy className={cn("w-8 h-8", passed ? "text-green-500" : "text-amber-500")} />
        </div>
        
        <h3 className="text-xl font-medium text-foreground mb-2">
          {passed ? "Congratulations!" : "Keep Learning!"}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          You scored <span className="text-foreground font-medium">{finalScore}%</span> on the {lessonTitle} quiz
        </p>
        
        <p className="text-sm text-muted-foreground mb-6">
          {correctAnswers} out of {questions.length} questions correct
        </p>

        {!passed && (
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">Quiz: {lessonTitle}</h3>
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-1.5 mb-6">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="text-foreground font-medium mb-4">{question?.question}</p>

          <div className="space-y-3 mb-6">
            {question?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  selectedAnswer === index
                    ? showResult
                      ? isCorrect
                        ? "border-green-500 bg-green-500/10"
                        : "border-red-500 bg-red-500/10"
                      : "border-primary bg-primary/10"
                    : showResult && index === question.correctIndex
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-primary/50 bg-secondary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    selectedAnswer === index ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {option}
                  </span>
                  {showResult && index === question.correctIndex && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {showResult && selectedAnswer === index && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg mb-6",
                isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-amber-500/10 border border-amber-500/20"
              )}
            >
              <p className="text-sm text-foreground">{question?.explanation}</p>
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            {!showResult ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
