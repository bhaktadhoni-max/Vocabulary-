import { useState, useEffect, useMemo, useCallback } from 'react';
import { VocabItem } from '../types';
import { ALL_VOCABULARY, TOTAL_VOCAB_COUNT } from '../data';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
export type N5Status = 'new' | 'learning' | 'review' | 'mastered';

export interface N5ReviewRecord {
  id: number;
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  status: N5Status;
}

export interface N5UserStats {
  studiedWordIds: number[];
  masteredWordIds: number[];
  favoriteWordIds: number[];
  streakDays: number;
  lastActiveDate: string;
  dailyGoal: number;
  todayStudiedCount: number;
  totalQuizTaken: number;
  totalQuizCorrect: number;
  totalQuizQuestions: number;
  currentLesson: number;
}

const N5_FAVORITES_KEY = 'jlpt_n5_bn_bookmarks';
const N5_MASTERED_KEY = 'jlpt_n5_bn_mastered';
const N5_REVIEWS_KEY = 'jlpt_n5_reviews';
const N5_STATS_KEY = 'jlpt_n5_stats';

const DEFAULT_STATS: N5UserStats = {
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
  currentLesson: 1,
};

export function useN5Progress() {
  // 1. Favorites / Bookmarks State
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(N5_FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 2. Mastered Set (preserved from previous versions)
  const [masteredIds, setMasteredIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(N5_MASTERED_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 3. Reviews Record State (Spaced Repetition)
  const [reviews, setReviews] = useState<Record<number, N5ReviewRecord>>(() => {
    try {
      const saved = localStorage.getItem(N5_REVIEWS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 4. User Stats & Streak
  const [stats, setStats] = useState<N5UserStats>(() => {
    try {
      const saved = localStorage.getItem(N5_STATS_KEY);
      if (saved) {
        const parsed: N5UserStats = JSON.parse(saved);
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
    } catch {}
    return DEFAULT_STATS;
  });

  // Save favorites to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N5_FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
    } catch (e) {
      console.warn('Failed saving N5 favorites:', e);
    }
  }, [favoriteIds]);

  // Save mastered to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N5_MASTERED_KEY, JSON.stringify(Array.from(masteredIds)));
    } catch (e) {
      console.warn('Failed saving N5 mastered:', e);
    }
  }, [masteredIds]);

  // Save reviews to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N5_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Failed saving N5 reviews:', e);
    }
  }, [reviews]);

  // Save stats to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(N5_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed saving N5 stats:', e);
    }
  }, [stats]);

  // Toggle Favorite
  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Mark Studied
  const markStudied = useCallback((id: number) => {
    setStats(prev => {
      const studied = new Set(prev.studiedWordIds);
      const isNew = !studied.has(id);
      studied.add(id);
      return {
        ...prev,
        studiedWordIds: Array.from(studied),
        todayStudiedCount: isNew ? prev.todayStudiedCount + 1 : prev.todayStudiedCount
      };
    });

    setReviews(prev => {
      if (prev[id]) return prev;
      const today = new Date();
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 1);

      return {
        ...prev,
        [id]: {
          id,
          interval: 1,
          repetition: 1,
          easeFactor: 2.5,
          nextReviewDate: nextDate.toISOString().slice(0, 10),
          lastReviewedDate: today.toISOString().slice(0, 10),
          status: 'learning'
        }
      };
    });
  }, []);

  // Mark Review (SM-2 SRS Algorithm)
  const markReview = useCallback((id: number, rating: ReviewRating) => {
    setReviews(prev => {
      const record = prev[id] || {
        id,
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString().slice(0, 10),
        status: 'learning' as N5Status
      };

      let { interval, repetition, easeFactor } = record;
      let newStatus: N5Status = 'learning';

      const today = new Date();
      const nextDate = new Date(today);

      if (rating === 'again') {
        repetition = 0;
        interval = 1;
        newStatus = 'review';
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (rating === 'hard') {
        repetition += 1;
        interval = Math.max(1, Math.round(interval * 1.2));
        newStatus = 'learning';
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        nextDate.setDate(nextDate.getDate() + interval);
      } else if (rating === 'good') {
        repetition += 1;
        if (repetition === 1) interval = 1;
        else if (repetition === 2) interval = 4;
        else interval = Math.round(interval * easeFactor);
        
        newStatus = repetition >= 4 ? 'mastered' : 'learning';
        nextDate.setDate(nextDate.getDate() + interval);
      } else if (rating === 'easy') {
        repetition += 1;
        if (repetition === 1) interval = 3;
        else if (repetition === 2) interval = 7;
        else interval = Math.round(interval * easeFactor * 1.3);

        easeFactor += 0.15;
        newStatus = 'mastered';
        nextDate.setDate(nextDate.getDate() + interval);
      }

      if (newStatus === 'mastered') {
        setMasteredIds(mPrev => new Set(mPrev).add(id));
      }

      return {
        ...prev,
        [id]: {
          id,
          interval,
          repetition,
          easeFactor,
          nextReviewDate: nextDate.toISOString().slice(0, 10),
          lastReviewedDate: today.toISOString().slice(0, 10),
          status: newStatus
        }
      };
    });

    setStats(prev => {
      const studied = new Set(prev.studiedWordIds);
      studied.add(id);
      return {
        ...prev,
        studiedWordIds: Array.from(studied),
        todayStudiedCount: prev.todayStudiedCount + 1
      };
    });
  }, []);

  // Current Lesson
  const setCurrentLesson = useCallback((lesson: number) => {
    setStats(prev => ({ ...prev, currentLesson: lesson }));
  }, []);

  // Daily Goal
  const setDailyGoal = useCallback((goal: number) => {
    setStats(prev => ({ ...prev, dailyGoal: Math.max(5, Math.min(100, goal)) }));
  }, []);

  // Record Quiz Result
  const recordQuizResult = useCallback((correct: number, total: number) => {
    setStats(prev => ({
      ...prev,
      totalQuizTaken: prev.totalQuizTaken + 1,
      totalQuizCorrect: prev.totalQuizCorrect + correct,
      totalQuizQuestions: prev.totalQuizQuestions + total,
    }));
  }, []);

  // Reset Progress
  const resetProgress = useCallback(() => {
    localStorage.removeItem(N5_FAVORITES_KEY);
    localStorage.removeItem(N5_MASTERED_KEY);
    localStorage.removeItem(N5_REVIEWS_KEY);
    localStorage.removeItem(N5_STATS_KEY);
    setFavoriteIds(new Set());
    setMasteredIds(new Set());
    setReviews({});
    setStats(DEFAULT_STATS);
  }, []);

  // Status mapping
  const statusMap = useMemo(() => {
    const map = new Map<number, N5Status>();
    ALL_VOCABULARY.forEach(item => {
      const rec = reviews[item.id];
      if (rec) {
        map.set(item.id, rec.status);
      } else if (masteredIds.has(item.id)) {
        map.set(item.id, 'mastered');
      } else if (stats.studiedWordIds.includes(item.id)) {
        map.set(item.id, 'learning');
      } else {
        map.set(item.id, 'new');
      }
    });
    return map;
  }, [reviews, masteredIds, stats.studiedWordIds]);

  // Due review items
  const dueReviewItems = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return ALL_VOCABULARY.filter(item => {
      const rec = reviews[item.id];
      if (!rec) return false;
      return rec.nextReviewDate <= todayStr;
    });
  }, [reviews]);

  // Counts by status
  const statusCounts = useMemo(() => {
    let newWords = 0;
    let learning = 0;
    let mastered = 0;
    let reviewDue = dueReviewItems.length;

    ALL_VOCABULARY.forEach(item => {
      const status = statusMap.get(item.id);
      if (status === 'mastered') mastered++;
      else if (status === 'learning' || status === 'review') learning++;
      else newWords++;
    });

    const learned = learning + mastered;
    const percentMastered = Math.round((mastered / TOTAL_VOCAB_COUNT) * 100);
    const percentLearned = Math.round((learned / TOTAL_VOCAB_COUNT) * 100);

    return {
      total: TOTAL_VOCAB_COUNT,
      newWords,
      learning,
      mastered,
      reviewDue,
      learned,
      percentMastered,
      percentLearned
    };
  }, [statusMap, dueReviewItems.length]);

  return {
    favoriteIds,
    masteredIds,
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
