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
    <div className="min-h-screen bg-[#fbf8f2] text-slate-900 flex flex-col relative overflow-x-hidden selection:bg-[#558b2f]/20 selection:text-[#558b2f] font-sans">
      
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
      <main className="flex-1 max-w-5xl w-full mx-auto pb-12 z-10">
        
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
                <h2 className="text-xl font-bold font-bengali text-slate-900 flex items-center gap-2">
                  <span>সংরক্ষিত শব্দাবলী (Bookmarked Words)</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                    {bookmarkedIds.size} টি
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-bengali mt-0.5">
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
                <h2 className="text-xl font-bold font-bengali text-slate-900 flex items-center gap-2">
                  <span>আয়ত্ত করা শব্দাবলী (Mastered Words)</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#f4f9ea] text-[#3f6e1f] border border-[#cce4ab]">
                    {masteredIds.size} টি
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-bengali mt-0.5">
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

      {/* Clean Light Footer */}
      <footer className="border-t border-[#e8e2d4] bg-[#fbf8f2]/90 backdrop-blur-md py-5 mt-auto z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bengali text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#558b2f]" />
              <span className="text-slate-700 font-medium">
                JLPT N5 জাপানি শব্দকোষ • ৮৩৮টি সম্পূর্ণ শব্দ ও বাংলা অনুবাদ
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#e5dec9] text-[#558b2f] font-semibold">
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
