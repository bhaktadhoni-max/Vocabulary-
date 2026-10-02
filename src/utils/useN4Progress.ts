import { useState, useEffect, useMemo, useCallback } from 'react';
import { N4VocabItem, N4ReviewRecord, ReviewRating, N4Status, N4UserStats } from '../data/n4/types';
import { N4_ALL_VOCABULARY, N4_TOTAL_COUNT } from '../data/n4';

const N4_FAVORITES_KEY = 'jlpt_n4_favorites';
const N4_REVIEWS_KEY = 'jlpt_n4_reviews';
const N4_STATS_KEY = 'jlpt_n4_stats';

const DEFAULT_STATS: N4UserStats = {
  studiedWordIds: [],
  masteredWordIds: [],
  favoriteWordIds: [],
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  dailyGoal: 20,
  todayStudiedCount: 0,
  totalQuizTaken: 0,
  totalQuizCorrect: 0,
  totalQuizQuestions: 0,
  currentLesson: 26,
};

export function useN4Progress() {
  // 1. Favorites State
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(N4_FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 2. Reviews Record State (Spaced Repetition)
  const [reviews, setReviews] = useState<Record<number, N4ReviewRecord>>(() => {
    try {
      const saved = localStorage.getItem(N4_REVIEWS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 3. User Stats & Streak
  const [stats, setStats] = useState<N4UserStats>(() => {
    try {
      const saved = localStorage.getItem(N4_STATS_KEY);
      if (saved) {
        const parsed: N4UserStats = JSON.parse(saved);
        const todayStr = new Date().toISOString().slice(0, 10);
        
        // Streak check
        if (parsed.lastActiveDate !== todayStr) {
          const lastDate = new Date(parsed.lastActiveDate);
          const today = new Date(todayStr);
          const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === 1) {
            parsed.streakDays = (parsed.streakDays || 1) + 1;
          } else if (diffDays > 1) {
            parsed.streakDays = 1;
          }
          parsed.todayStudiedCount = 0;
          parsed.lastActiveDate = todayStr;
        }
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATS;
  });

  // Save favorites to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N4_FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
    } catch (e) {
      console.warn('Failed saving N4 favorites:', e);
    }
  }, [favoriteIds]);

  // Save reviews to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N4_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Failed saving N4 reviews:', e);
    }
  }, [reviews]);

  // Save stats to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N4_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed saving N4 stats:', e);
    }
  }, [stats]);

  // Toggle Favorite
  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Mark a word as studied
  const markStudied = useCallback((id: number) => {
    setStats((prev) => {
      if (prev.studiedWordIds.includes(id)) {
        return prev;
      }
      return {
        ...prev,
        studiedWordIds: [...prev.studiedWordIds, id],
        todayStudiedCount: prev.todayStudiedCount + 1,
      };
    });
  }, []);

  // Mark Spaced Repetition Review (Again, Hard, Good, Easy)
  const markReview = useCallback((id: number, rating: ReviewRating) => {
    const now = new Date();
    const current = reviews[id] || {
      id,
      status: 'learning' as N4Status,
      interval: 1,
      easeFactor: 2.5,
      reps: 0,
      lapses: 0,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: now.toISOString(),
    };

    let nextInterval = current.interval;
    let nextEase = current.easeFactor;
    let nextReps = current.reps;
    let nextLapses = current.lapses;
    let nextStatus: N4Status = current.status;

    if (rating === 'again') {
      nextInterval = 1;
      nextReps = 0;
      nextLapses += 1;
      nextStatus = 'learning';
      nextEase = Math.max(1.3, nextEase - 0.2);
    } else if (rating === 'hard') {
      nextInterval = Math.max(1, Math.round(nextInterval * 1.2));
      nextStatus = 'review';
      nextEase = Math.max(1.3, nextEase - 0.15);
    } else if (rating === 'good') {
      nextReps += 1;
      if (nextReps === 1) nextInterval = 1;
      else if (nextReps === 2) nextInterval = 3;
      else nextInterval = Math.round(nextInterval * nextEase);
      
      nextStatus = nextReps >= 3 ? 'mastered' : 'review';
    } else if (rating === 'easy') {
      nextReps += 1;
      if (nextReps === 1) nextInterval = 3;
      else nextInterval = Math.round(nextInterval * nextEase * 1.3);
      
      nextEase += 0.15;
      nextStatus = nextReps >= 2 ? 'mastered' : 'review';
    }

    const nextDueDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

    const updatedRecord: N4ReviewRecord = {
      id,
      status: nextStatus,
      interval: nextInterval,
      easeFactor: Number(nextEase.toFixed(2)),
      reps: nextReps,
      lapses: nextLapses,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: nextDueDate.toISOString(),
    };

    setReviews((prev) => ({ ...prev, [id]: updatedRecord }));

    // Also update stats
    setStats((prev) => {
      const isStudied = prev.studiedWordIds.includes(id);
      const newStudied = isStudied ? prev.studiedWordIds : [...prev.studiedWordIds, id];
      const isMastered = prev.masteredWordIds.includes(id);
      let newMastered = prev.masteredWordIds;

      if (nextStatus === 'mastered' && !isMastered) {
        newMastered = [...newMastered, id];
      } else if (nextStatus !== 'mastered' && isMastered) {
        newMastered = newMastered.filter((mId) => mId !== id);
      }

      return {
        ...prev,
        studiedWordIds: newStudied,
        masteredWordIds: newMastered,
        todayStudiedCount: prev.todayStudiedCount + 1,
      };
    });
  }, [reviews]);

  // Set Current Lesson
  const setCurrentLesson = useCallback((lesson: number) => {
    setStats((prev) => ({ ...prev, currentLesson: lesson }));
  }, []);

  // Set Daily Goal
  const setDailyGoal = useCallback((goal: number) => {
    setStats((prev) => ({ ...prev, dailyGoal: Math.max(5, goal) }));
  }, []);

  // Record Quiz Result
  const recordQuizResult = useCallback((correctCount: number, totalQuestions: number) => {
    setStats((prev) => ({
      ...prev,
      totalQuizTaken: prev.totalQuizTaken + 1,
      totalQuizCorrect: prev.totalQuizCorrect + correctCount,
      totalQuizQuestions: prev.totalQuizQuestions + totalQuestions,
      todayStudiedCount: prev.todayStudiedCount + totalQuestions,
    }));
  }, []);

  // Reset Progress
  const resetProgress = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm('আপনি কি নিশ্চিত যে সকল N4 অগ্রগতি রিসেট করতে চান?')) {
      return;
    }
    setFavoriteIds(new Set());
    setReviews({});
    setStats(DEFAULT_STATS);
    try {
      localStorage.removeItem(N4_FAVORITES_KEY);
      localStorage.removeItem(N4_REVIEWS_KEY);
      localStorage.removeItem(N4_STATS_KEY);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Derived counts
  const learnedCount = stats.studiedWordIds.length;
  const masteredCount = stats.masteredWordIds.length;
  const favoriteCount = favoriteIds.size;

  const statusMap = useMemo(() => {
    const map = new Map<number, N4Status>();
    for (const [idStr, rec] of Object.entries(reviews) as [string, N4ReviewRecord][]) {
      map.set(Number(idStr), rec.status);
    }
    return map;
  }, [reviews]);

  // Category counts
  const statusCounts = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let reviewDue = 0;
    const nowIso = new Date().toISOString();

    for (const item of N4_ALL_VOCABULARY) {
      const rec = reviews[item.id];
      if (!rec) continue;
      if (rec.status === 'mastered') {
        mastered++;
      } else if (rec.status === 'review' || rec.status === 'learning') {
        learning++;
        if (rec.nextReviewAt <= nowIso) {
          reviewDue++;
        }
      }
    }

    const unstudied = N4_TOTAL_COUNT - (mastered + learning);

    return {
      total: N4_TOTAL_COUNT,
      newWords: unstudied,
      learning,
      mastered,
      reviewDue,
      learned: learnedCount,
      percentMastered: Math.round((mastered / (N4_TOTAL_COUNT || 1)) * 100),
      percentLearned: Math.round((learnedCount / (N4_TOTAL_COUNT || 1)) * 100),
    };
  }, [reviews, learnedCount]);

  // Review Due items
  const dueReviewItems = useMemo(() => {
    const nowIso = new Date().toISOString();
    const dueIds = new Set<number>();

    for (const [idStr, rec] of Object.entries(reviews) as [string, N4ReviewRecord][]) {
      if (rec.nextReviewAt <= nowIso) {
        dueIds.add(Number(idStr));
      }
    }

    return N4_ALL_VOCABULARY.filter((item) => dueIds.has(item.id));
  }, [reviews]);

  return {
    favoriteIds,
    reviews,
    stats,
    statusMap,
    statusCounts,
    dueReviewItems,
    toggleFavorite,
    markStudied,
    markReview,
    setCurrentLesson,
    setDailyGoal,
    recordQuizResult,
    resetProgress,
  };
}
