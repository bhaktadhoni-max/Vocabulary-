import React, { useState, useMemo } from 'react';
import { ALL_VOCABULARY, TOTAL_VOCAB_COUNT } from '../../data';
import { VocabItem } from '../../types';
import { useN5Progress } from '../../utils/useN5Progress';
import { N5Navbar, N5ActiveTab } from './N5Navbar';
import { N5Dashboard } from './N5Dashboard';
import { N5LessonsView } from './N5LessonsView';
import { N5FavoritesView } from './N5FavoritesView';
import { N5ProgressView } from './N5ProgressView';
import { FlashcardView } from '../FlashcardView';
import { VocabListView } from '../VocabListView';
import { QuizView } from '../QuizView';
import { ReviewDashboard } from '../ReviewDashboard';
import { PdfBookView } from '../PdfBookView';
import { ResourcesView } from '../ResourcesView';
import { N5_LESSONS_META } from '../../data/n5LessonsMeta';

interface N5VocabularySectionProps {
  activeLevel: 'N4' | 'N5';
  onSwitchLevel: (level: 'N4' | 'N5') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVoiceSettings: () => void;
}

export const N5VocabularySection: React.FC<N5VocabularySectionProps> = ({
  activeLevel,
  onSwitchLevel,
  isDarkMode,
  onToggleDarkMode,
  onOpenVoiceSettings,
}) => {
  const [currentTab, setCurrentTab] = useState<N5ActiveTab>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isReviewSession, setIsReviewSession] = useState<boolean>(false);

  const {
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
  } = useN5Progress();

  // Filtered vocabulary for flashcards / list
  const activeVocabItems = useMemo(() => {
    let items = ALL_VOCABULARY;
    
    // Filter by lesson if selected
    if (selectedLesson !== 'all') {
      items = items.filter(v => v.lesson === selectedLesson);
    }

    // Filter by category if selected
    if (selectedCategory !== 'all') {
      items = items.filter(v => v.categoryKey === selectedCategory);
    }

    return items;
  }, [selectedLesson, selectedCategory]);

  // Handle lesson selection from lesson view
  const handleSelectLessonToStudy = (lessonNum: number) => {
    setSelectedLesson(lessonNum);
    setSelectedCategory('all');
    setCurrentLesson(lessonNum);
    setCurrentTab('flashcards');
  };

  const handleSelectLessonToQuiz = (lessonNum: number) => {
    setSelectedLesson(lessonNum);
    setCurrentTab('quiz');
  };

  // Convert reviews to practiceRecords for backwards compatibility with ReviewDashboard
  const practiceRecords = useMemo(() => {
    const records: Record<number, any> = {};
    Object.values(reviews).forEach((rec: any) => {
      records[rec.id] = {
        id: rec.id,
        wrongCount: rec.repetition === 0 ? 1 : 0,
        reviewCount: rec.repetition,
        consecutiveCorrect: rec.repetition,
        lastReviewedAt: rec.lastReviewedDate
      };
    });
    return records;
  }, [reviews]);

  return (
    <div className="min-h-screen jp-layered-bg text-[#191c21] dark:text-[#f6f8fb] flex flex-col font-sans transition-colors duration-200">
      
      {/* N5 Top Navigation */}
      <N5Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (isReviewSession && tab !== 'flashcards') {
            setIsReviewSession(false);
          }
          setCurrentTab(tab);
        }}
        activeLevel={activeLevel}
        onSwitchLevel={onSwitchLevel}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onOpenVoiceSettings={onOpenVoiceSettings}
        dueReviewCount={dueReviewItems.length}
        favoriteCount={favoriteIds.size}
        streakDays={stats.streakDays}
        todayStudiedCount={stats.todayStudiedCount}
        dailyGoal={stats.dailyGoal}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 z-10">
        
        {/* 1. DASHBOARD */}
        {currentTab === 'dashboard' && (
          <N5Dashboard
            stats={stats}
            statusCounts={statusCounts}
            favoriteCount={favoriteIds.size}
            onNavigateTab={setCurrentTab}
            onSelectLesson={handleSelectLessonToStudy}
          />
        )}

        {/* 2. LESSONS VIEW (Minna no Nihongo Lessons 1-25) */}
        {currentTab === 'lessons' && (
          <N5LessonsView
            studiedWordIds={stats.studiedWordIds}
            masteredWordIds={stats.masteredWordIds}
            onSelectLessonToStudy={handleSelectLessonToStudy}
            onSelectLessonToQuiz={handleSelectLessonToQuiz}
          />
        )}

        {/* 3. FLASHCARDS VIEW */}
        {currentTab === 'flashcards' && (
          <div className="space-y-4">
            {/* Active Lesson indicator bar if filtered */}
            {selectedLesson !== 'all' && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#fdf5f3] dark:bg-[#2c1514] border border-[#f5c6cb] dark:border-[#4d2121] text-xs font-bengali">
                <span className="text-[#c23b22] font-bold">
                  📖 ফিল্টার: লেসন {selectedLesson} ({N5_LESSONS_META.find(l => l.lesson === selectedLesson)?.titleBn || ''})
                </span>
                <button
                  onClick={() => setSelectedLesson('all')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141720] text-[#c23b22] font-bold border border-[#f5c6cb] dark:border-[#4d2121] hover:bg-[#c23b22] hover:text-white transition cursor-pointer"
                >
                  সব লেসন দেখুন
                </button>
              </div>
            )}

            <FlashcardView
              items={activeVocabItems}
              allVocab={ALL_VOCABULARY}
              bookmarkedIds={favoriteIds}
              masteredIds={masteredIds}
              practiceRecords={practiceRecords}
              onToggleBookmark={toggleFavorite}
              onToggleMastered={(id) => markReview(id, 'good')}
              onMarkDontKnow={(id) => markReview(id, 'again')}
              onMarkKnowInReview={(id) => markReview(id, 'good')}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onResetFilters={() => {
                setSelectedCategory('all');
                setSelectedLesson('all');
                setIsReviewSession(false);
              }}
              onOpenVoiceSettings={onOpenVoiceSettings}
              isReviewSession={isReviewSession}
              onBackToReviewDashboard={() => {
                setIsReviewSession(false);
                setCurrentTab('review');
              }}
              activeLevel={activeLevel}
              onSwitchLevel={onSwitchLevel}
            />
          </div>
        )}

        {/* 4. GRID / ALL WORDS LIST VIEW */}
        {currentTab === 'grid' && (
          <VocabListView
            items={activeVocabItems}
            bookmarkedIds={favoriteIds}
            masteredIds={masteredIds}
            onToggleBookmark={toggleFavorite}
            onToggleMastered={(id) => markReview(id, 'good')}
            onSelectWordForPractice={(word) => {
              setSelectedLesson(word.lesson || 'all');
              setCurrentTab('flashcards');
            }}
          />
        )}

        {/* 5. PRACTICE & QUIZ VIEW */}
        {currentTab === 'quiz' && (
          <div className="space-y-4">
            {selectedLesson !== 'all' && (
              <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#fdf5f3] dark:bg-[#2c1514] border border-[#f5c6cb] dark:border-[#4d2121] text-xs font-bengali max-w-xl mx-auto">
                <span className="text-[#c23b22] font-bold">
                  কুইজ লেসন: {selectedLesson}
                </span>
                <button
                  onClick={() => setSelectedLesson('all')}
                  className="text-xs font-bold text-[#c23b22] hover:underline"
                >
                  সব শব্দ থেকে কুইজ
                </button>
              </div>
            )}

            <QuizView
              allVocab={activeVocabItems.length >= 4 ? activeVocabItems : ALL_VOCABULARY}
              onBack={() => setCurrentTab('dashboard')}
            />
          </div>
        )}

        {/* 6. SPACED REPETITION REVIEW DASHBOARD */}
        {currentTab === 'review' && (
          <ReviewDashboard
            allVocab={ALL_VOCABULARY}
            practiceRecords={practiceRecords}
            onStartReview={() => {
              setIsReviewSession(true);
              setCurrentTab('flashcards');
            }}
            onClearMasteredItem={(id) => markReview(id, 'again')}
            onOpenVoiceSettings={onOpenVoiceSettings}
          />
        )}

        {/* 7. FAVORITES / BOOKMARKS VIEW */}
        {currentTab === 'favorites' && (
          <N5FavoritesView
            allVocab={ALL_VOCABULARY}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onStartStudyFavorites={() => {
              setSelectedCategory('all');
              setSelectedLesson('all');
              setCurrentTab('flashcards');
            }}
          />
        )}

        {/* 8. PROGRESS & STATS VIEW */}
        {currentTab === 'progress' && (
          <N5ProgressView
            stats={stats}
            statusCounts={statusCounts}
            favoriteCount={favoriteIds.size}
            onSetDailyGoal={setDailyGoal}
            onResetProgress={resetProgress}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* 9. PDF BOOK VIEW */}
        {currentTab === 'book' && (
          <PdfBookView
            items={activeVocabItems}
            bookmarkedIds={favoriteIds}
            masteredIds={masteredIds}
            onToggleBookmark={toggleFavorite}
            onToggleMastered={(id) => markReview(id, 'good')}
          />
        )}

        {/* 10. GRAMMAR RESOURCES VIEW */}
        {currentTab === 'resources' && (
          <ResourcesView />
        )}

      </main>

      {/* Theme-Aware Professional Footer */}
      <footer className="border-t border-[#e8e3d8] dark:border-[#222735] bg-white/80 dark:bg-[#0d0f14]/80 backdrop-blur-md py-6 mt-auto z-20 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bengali text-[#737885] dark:text-[#8d97ab]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#c23b22] text-white flex items-center justify-center font-japanese text-[10px] font-bold">
              語
            </span>
            <span>JLPT N5 জাপানি শব্দভাণ্ডার • Minna no Nihongo Lesson 1–25</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSwitchLevel(activeLevel === 'N5' ? 'N4' : 'N5')}
              className="text-[#c23b22] hover:underline font-bold"
            >
              JLPT {activeLevel === 'N5' ? 'N4' : 'N5'} এ যান
            </button>
            <span>•</span>
            <span>সর্বমোট ৮৯১টি শব্দ</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
