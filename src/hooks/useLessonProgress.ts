import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MODULES } from "@/lib/learn-content";

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  quiz_score: number | null;
  quiz_attempts: number;
  time_spent_seconds: number;
  last_accessed_at: string;
}

export const useLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["lesson-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user?.id,
  });

  const markComplete = useMutation({
    mutationFn: async ({ lessonId, moduleId }: { lessonId: string; moduleId: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("lesson_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            module_id: moduleId,
            completed: true,
            completed_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
    },
  });

  const saveQuizScore = useMutation({
    mutationFn: async ({ 
      lessonId, 
      moduleId, 
      score 
    }: { 
      lessonId: string; 
      moduleId: string; 
      score: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("id, quiz_attempts")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("lesson_progress")
          .update({
            quiz_score: score,
            quiz_attempts: (existing.quiz_attempts || 0) + 1,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            module_id: moduleId,
            quiz_score: score,
            quiz_attempts: 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
    },
  });

  const updateTimeSpent = useMutation({
    mutationFn: async ({ 
      lessonId, 
      moduleId, 
      seconds 
    }: { 
      lessonId: string; 
      moduleId: string; 
      seconds: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("id, time_spent_seconds")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("lesson_progress")
          .update({
            time_spent_seconds: (existing.time_spent_seconds || 0) + seconds,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            module_id: moduleId,
            time_spent_seconds: seconds,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
    },
  });

  const isLessonCompleted = (lessonId: string): boolean => {
    return progress?.some(p => p.lesson_id === lessonId && p.completed) ?? false;
  };

  const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
    return progress?.find(p => p.lesson_id === lessonId);
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress?.filter(p => p.module_id === moduleId) ?? [];
    const completed = moduleProgress.filter(p => p.completed).length;
    return { completed, total: moduleProgress.length };
  };

  const getOverallStats = () => {
    const completed = progress?.filter(p => p.completed).length ?? 0;
    const totalTimeSeconds = progress?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) ?? 0;
    const quizzesCompleted = progress?.filter(p => p.quiz_score !== null).length ?? 0;
    const avgQuizScore = progress?.filter(p => p.quiz_score !== null)
      .reduce((sum, p, _, arr) => sum + (p.quiz_score || 0) / arr.length, 0) ?? 0;
    
    return {
      lessonsCompleted: completed,
      totalTimeSeconds,
      quizzesCompleted,
      avgQuizScore: Math.round(avgQuizScore),
    };
  };

  return {
    progress,
    isLoading,
    markComplete,
    saveQuizScore,
    updateTimeSpent,
    isLessonCompleted,
    getLessonProgress,
    getModuleProgress,
    getOverallStats,
  };
};
