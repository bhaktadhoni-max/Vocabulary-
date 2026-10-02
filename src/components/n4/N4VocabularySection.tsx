import React, { useState, useMemo } from 'react';
import { N4ActiveTab, N4VocabItem } from '../../data/n4/types';
import { N4_ALL_VOCABULARY, N4_TOTAL_COUNT, N4_VOCAB_BY_LESSON } from '../../data/n4';
import { useN4Progress } from '../../utils/useN4Progress';
import { N4Navbar } from './N4Navbar';
import { N4Dashboard } from './N4Dashboard';
import { N4LessonsView } from './N4LessonsView';
import { N4FlashcardView } from './N4FlashcardView';
import { N4GridView } from './N4GridView';
import { N4QuizView } from './N4QuizView';
import { N4ReviewView } from './N4ReviewView';
import { N4FavoritesView } from './N4FavoritesView';
import { N4ProgressView } from './N4ProgressView';
import { ResourcesView } from '../ResourcesView';

interface N4VocabularySectionProps {
  activeLevel: 'N4' | 'N5';
  onSwitchLevel: (level: 'N4' | 'N5') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVoiceSettings: () => void;
}

export const N4VocabularySection: React.FC<N4VocabularySectionProps> = ({
  activeLevel,
  onSwitchLevel,
  isDarkMode,
  onToggleDarkMode,
  onOpenVoiceSettings,
}) => {
  const [currentTab, setCurrentTab] = useState<N4ActiveTab>('flashcards');
  const [selectedLesson, setSelectedLesson] = useState<number | 'all'>('all');
  const [quizInitialLesson, setQuizInitialLesson] = useState<number | 'all'>('all');

  const {
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
  } = useN4Progress();

  const dueItemIds = useMemo(() => {
    return new Set(dueReviewItems.map(item => item.id));
  }, [dueReviewItems]);

  const allLearningItems = useMemo(() => {
    return N4_ALL_VOCABULARY.filter(item => {
      const rec = reviews[item.id];
      return rec && (rec.status === 'learning' || rec.status === 'review');
    });
  }, [reviews]);

  // Handle lesson selection from lesson view
  const handleSelectLessonToStudy = (lessonNum: number) => {
    setSelectedLesson(lessonNum);
    setCurrentLesson(lessonNum);
    setCurrentTab('flashcards');
  };

  const handleSelectLessonToQuiz = (lessonNum: number) => {
    setQuizInitialLesson(lessonNum);
    setCurrentTab('quiz');
  };

  return (
    <div className="min-h-screen jp-layered-bg text-[#191c21] dark:text-[#f6f8fb] flex flex-col font-sans transition-colors duration-200">
      
      {/* N4 Top Navigation */}
      <N4Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
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
          <N4Dashboard
            stats={stats}
            statusCounts={statusCounts}
            favoriteCount={favoriteIds.size}
            onNavigateTab={setCurrentTab}
            onSelectLesson={handleSelectLessonToStudy}
          />
        )}

        {/* 2. LESSONS VIEW */}
        {currentTab === 'lessons' && (
          <N4LessonsView
            studiedWordIds={stats.studiedWordIds}
            masteredWordIds={stats.masteredWordIds}
            onSelectLessonToStudy={handleSelectLessonToStudy}
            onSelectLessonToQuiz={handleSelectLessonToQuiz}
          />
        )}

        {/* 3. FLASHCARDS VIEW */}
        {currentTab === 'flashcards' && (
          <N4FlashcardView
            items={N4_ALL_VOCABULARY}
            favoriteIds={favoriteIds}
            statusMap={statusMap}
            masteredIds={new Set(stats.masteredWordIds)}
            onToggleFavorite={toggleFavorite}
            onMarkStudied={markStudied}
            onMarkReview={markReview}
            selectedLesson={selectedLesson}
            onSelectLesson={setSelectedLesson}
            onOpenVoiceSettings={onOpenVoiceSettings}
            activeLevel={activeLevel}
            onSwitchLevel={onSwitchLevel}
          />
        )}

        {/* 4. GRID & LIST SEARCH VIEW */}
        {currentTab === 'grid' && (
          <N4GridView
            items={N4_ALL_VOCABULARY}
            favoriteIds={favoriteIds}
            statusMap={statusMap}
            dueItemIds={dueItemIds}
            onToggleFavorite={toggleFavorite}
            onSelectWordForStudy={(item) => {
              setSelectedLesson(item.lesson);
              setCurrentTab('flashcards');
            }}
          />
        )}

        {/* 5. PRACTICE & QUIZ VIEW */}
        {currentTab === 'quiz' && (
          <N4QuizView
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onRecordResult={recordQuizResult}
            initialLesson={quizInitialLesson}
          />
        )}

        {/* 6. SPACED REPETITION REVIEW */}
        {currentTab === 'review' && (
          <N4ReviewView
            dueItems={dueReviewItems}
            allLearningItems={allLearningItems}
            reviews={reviews}
            favoriteIds={favoriteIds}
            onMarkReview={markReview}
            onToggleFavorite={toggleFavorite}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* 7. FAVORITES VIEW */}
        {currentTab === 'favorites' && (
          <N4FavoritesView
            allVocab={N4_ALL_VOCABULARY}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onStartStudyFavorites={() => setCurrentTab('flashcards')}
          />
        )}

        {/* 8. RESOURCES VIEW */}
        {currentTab === 'resources' && (
          <ResourcesView
            currentLevel="N4"
            onNavigateMode={(tab) => setCurrentTab(tab as N4ActiveTab)}
          />
        )}

        {/* 9. PROGRESS & STATS VIEW */}
        {currentTab === 'progress' && (
          <N4ProgressView
            stats={stats}
            statusCounts={statusCounts}
            favoriteCount={favoriteIds.size}
            onSetDailyGoal={setDailyGoal}
            onResetProgress={resetProgress}
            onNavigateTab={setCurrentTab}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e3d8] dark:border-[#222735] bg-white/80 dark:bg-[#0d0f14]/80 backdrop-blur-md py-5 mt-auto z-20 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bengali text-[#737885] dark:text-[#8d97ab]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c23b22] dark:bg-[#e0452d]" />
            <span className="text-[#191c21] dark:text-[#f6f8fb]">
              JLPT N4 জাপানি শব্দভাণ্ডার • মিন্না নো নিহোঙ্গো লেসন ২৬ — ৫০ • মোট {N4_TOTAL_COUNT}টি শব্দ ও ব্যাকরণিক প্রয়োগ
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#737885] dark:text-[#8d97ab]">
            <span className="px-2 py-0.5 rounded-full bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-[#191c21] dark:text-[#f6f8fb] font-semibold">
              OFFLINE READY
            </span>
            <span>JAPANESE TTS AUDIO</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
