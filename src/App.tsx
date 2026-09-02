import React, { useState, useEffect, useMemo } from 'react';
import { ALL_VOCABULARY, TOTAL_VOCAB_COUNT } from './data';
import { StudyMode, VocabItem } from './types';
import { Navbar } from './components/Navbar';
import { FlashcardView } from './components/FlashcardView';
import { VocabListView } from './components/VocabListView';
import { QuizView } from './components/QuizView';
import { PdfBookView } from './components/PdfBookView';
import { StatsModal } from './components/StatsModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { EmptyState } from './components/EmptyState';

const BOOKMARKS_STORAGE_KEY = 'jlpt_n5_bn_bookmarks';
const MASTERED_STORAGE_KEY = 'jlpt_n5_bn_mastered';

export function App() {
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);

  // Local state persisted offline
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [masteredIds, setMasteredIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(MASTERED_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(Array.from(masteredIds)));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [masteredIds]);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleMastered = (id: number) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResetProgress = () => {
    setBookmarkedIds(new Set());
    setMasteredIds(new Set());
    try {
      localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
      localStorage.removeItem(MASTERED_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Filtered vocabulary items for the active mode
  const activeVocabItems = useMemo(() => {
    return ALL_VOCABULARY.filter((item) => {
      // If mode is bookmarked
      if (studyMode === 'bookmarked' && !bookmarkedIds.has(item.id)) {
        return false;
      }
      // If mode is mastered
      if (studyMode === 'mastered' && !masteredIds.has(item.id)) {
        return false;
      }
      // If category filter is applied
      if (selectedCategory !== 'all' && item.categoryKey !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [studyMode, bookmarkedIds, masteredIds, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Immersive Ambient Glow Orbs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-900/25 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>
      
      {/* Top Sticky Navigation */}
      <Navbar
        currentMode={studyMode}
        onSelectMode={(mode) => {
          setStudyMode(mode);
          if (mode === 'flashcards' || mode === 'list' || mode === 'book') {
            setSelectedCategory('all');
          }
        }}
        totalCount={TOTAL_VOCAB_COUNT}
        masteredCount={masteredIds.size}
        bookmarkedCount={bookmarkedIds.size}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-16 z-10">
        
        {/* FLASHCARD MODE */}
        {studyMode === 'flashcards' && (
          <FlashcardView
            items={activeVocabItems}
            allVocab={ALL_VOCABULARY}
            bookmarkedIds={bookmarkedIds}
            masteredIds={masteredIds}
            onToggleBookmark={toggleBookmark}
            onToggleMastered={toggleMastered}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onResetFilters={() => setSelectedCategory('all')}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          />
        )}

        {/* VOCABULARY LIST MODE */}
        {studyMode === 'list' && (
          <VocabListView
            allVocab={ALL_VOCABULARY}
            bookmarkedIds={bookmarkedIds}
            masteredIds={masteredIds}
            onToggleBookmark={toggleBookmark}
            onToggleMastered={toggleMastered}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            onNavigateToBook={() => setStudyMode('book')}
          />
        )}

        {/* QUIZ MODE */}
        {studyMode === 'quiz' && (
          <QuizView
            allVocab={ALL_VOCABULARY}
            onToggleBookmark={toggleBookmark}
            bookmarkedIds={bookmarkedIds}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          />
        )}

        {/* PDF BOOK MODE */}
        {studyMode === 'book' && (
          <PdfBookView
            allVocab={ALL_VOCABULARY}
            bookmarkedIds={bookmarkedIds}
            masteredIds={masteredIds}
            onToggleBookmark={toggleBookmark}
            onToggleMastered={toggleMastered}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          />
        )}

        {/* BOOKMARKED ITEMS MODE */}
        {studyMode === 'bookmarked' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold font-bengali text-white flex items-center gap-2">
                  <span>সংরক্ষিত শব্দাবলী (Bookmarked Words)</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {bookmarkedIds.size} টি
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-bengali mt-0.5">
                  আপনার স্টার চিহ্নিত প্রয়োজনীয় শব্দগুলো এখানে অনুশীলনের জন্য রাখা হয়েছে
                </p>
              </div>
            </div>

            {bookmarkedIds.size === 0 ? (
              <EmptyState
                type="bookmarks"
                onResetFilters={() => setStudyMode('flashcards')}
                onRestoreAll={() => setStudyMode('list')}
              />
            ) : (
              <FlashcardView
                items={activeVocabItems}
                allVocab={ALL_VOCABULARY}
                bookmarkedIds={bookmarkedIds}
                masteredIds={masteredIds}
                onToggleBookmark={toggleBookmark}
                onToggleMastered={toggleMastered}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onResetFilters={() => setSelectedCategory('all')}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              />
            )}
          </div>
        )}

        {/* MASTERED ITEMS MODE */}
        {studyMode === 'mastered' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold font-bengali text-white flex items-center gap-2">
                  <span>আয়ত্ত করা শব্দাবলী (Mastered Words)</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {masteredIds.size} টি
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-bengali mt-0.5">
                  যেসব শব্দ সফলভাবে মুখস্ত সম্পন্ন হয়েছে
                </p>
              </div>
            </div>

            {masteredIds.size === 0 ? (
              <EmptyState
                type="mastered"
                onResetFilters={() => setStudyMode('flashcards')}
                onRestoreAll={() => setStudyMode('list')}
              />
            ) : (
              <FlashcardView
                items={activeVocabItems}
                allVocab={ALL_VOCABULARY}
                bookmarkedIds={bookmarkedIds}
                masteredIds={masteredIds}
                onToggleBookmark={toggleBookmark}
                onToggleMastered={toggleMastered}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onResetFilters={() => setSelectedCategory('all')}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              />
            )}
          </div>
        )}

      </main>

      {/* Progress & Category Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        allVocab={ALL_VOCABULARY}
        masteredIds={masteredIds}
        bookmarkedIds={bookmarkedIds}
        onResetProgress={handleResetProgress}
      />

      {/* Clear & Smooth Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      {/* Immersive Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-xl py-6 mt-auto z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bengali text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">
                JLPT N5 জাপানি শব্দকোষ • ৮০০+ সম্পূর্ণ শব্দ ও বাংলা অনুবাদ
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                OFFLINE READY
              </span>
              <span>AUDIO TTS ENABLED</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
