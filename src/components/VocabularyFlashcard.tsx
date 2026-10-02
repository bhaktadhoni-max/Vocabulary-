import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Volume2, 
  RotateCw, 
  RotateCcw, 
  Check, 
  Bell, 
  Award, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { VocabularyFlashcardItem, VOCABULARY_FLASHCARDS_DATA } from '../data/vocabularyFlashcardsData';

interface VocabularyFlashcardProps {
  items?: VocabularyFlashcardItem[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

const STORAGE_KEYS = {
  CHECKED: 'vocab_card_checked_ids',
  REMINDER: 'vocab_card_reminder_ids',
  MEMORIZED: 'vocab_card_memorized_ids',
  SHOW_READING: 'vocab_show_reading_front',
};

// Safe helper for reading Sets from localStorage
function getStoredSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

// Safe helper for saving Sets to localStorage
function saveStoredSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

// Safe Text-to-Speech function matching requirements: lang ja-JP, rate 0.85
function speakJapaneseTTS(text: string): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;

    // Pick a natural Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export const VocabularyFlashcard: React.FC<VocabularyFlashcardProps> = ({
  items = VOCABULARY_FLASHCARDS_DATA,
  initialIndex = 0,
  onIndexChange,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return Math.max(0, Math.min(initialIndex, items.length - 1));
  });

  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Toggle "あ Reading" setting saved in localStorage
  const [showReadingOnFront, setShowReadingOnFront] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_READING);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Persistent word statuses: checked, reminder, memorized (keyed by word)
  const [checkedWords, setCheckedWords] = useState<Set<string>>(() => getStoredSet(STORAGE_KEYS.CHECKED));
  const [reminderWords, setReminderWords] = useState<Set<string>>(() => getStoredSet(STORAGE_KEYS.REMINDER));
  const [memorizedWords, setMemorizedWords] = useState<Set<string>>(() => getStoredSet(STORAGE_KEYS.MEMORIZED));

  // Audio playing indicators
  const [isPlayingWord, setIsPlayingWord] = useState<boolean>(false);
  const [isPlayingExample, setIsPlayingExample] = useState<boolean>(false);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } catch {
      // fallback
    }
  }, []);

  const currentWordItem: VocabularyFlashcardItem | undefined = items[currentIndex];
  const wordKey = currentWordItem ? currentWordItem.word : '';

  // Synchronize index change callback
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Flip card handler
  const handleCardFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Toggle "あ Reading" on front & persist
  const toggleReadingOnFront = useCallback(() => {
    setShowReadingOnFront(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.SHOW_READING, String(next));
      } catch (err) {
        console.warn('Failed to save reading toggle state:', err);
      }
      return next;
    });
  }, []);

  // Status toggle handlers (must stop propagation to not trigger flip!)
  const toggleChecked = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!wordKey) return;

    setCheckedWords((prev: Set<string>) => {
      const next = new Set<string>(prev);
      if (next.has(wordKey)) {
        next.delete(wordKey);
      } else {
        next.add(wordKey);
      }
      saveStoredSet(STORAGE_KEYS.CHECKED, next);
      return next;
    });
  }, [wordKey]);

  const toggleReminder = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!wordKey) return;

    setReminderWords((prev: Set<string>) => {
      const next = new Set<string>(prev);
      if (next.has(wordKey)) {
        next.delete(wordKey);
      } else {
        next.add(wordKey);
      }
      saveStoredSet(STORAGE_KEYS.REMINDER, next);
      return next;
    });
  }, [wordKey]);

  const toggleMemorized = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!wordKey) return;

    setMemorizedWords((prev: Set<string>) => {
      const next = new Set<string>(prev);
      if (next.has(wordKey)) {
        next.delete(wordKey);
      } else {
        next.add(wordKey);
      }
      saveStoredSet(STORAGE_KEYS.MEMORIZED, next);
      return next;
    });
  }, [wordKey]);

  // Audio speech handlers
  const handlePlayReading = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWordItem) return;
    setIsPlayingWord(true);
    speakJapaneseTTS(currentWordItem.reading || currentWordItem.word);
    setTimeout(() => setIsPlayingWord(false), 1200);
  }, [currentWordItem]);

  const handlePlayExample = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWordItem?.example?.jp) return;
    setIsPlayingExample(true);
    speakJapaneseTTS(currentWordItem.example.jp);
    setTimeout(() => setIsPlayingExample(false), 2400);
  }, [currentWordItem]);

  // Keyboard navigation:
  // Space = flip, Left/Right = previous/next, R = Reminder, M = Memorized
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleCardFlip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'KeyR':
          e.preventDefault();
          toggleReminder();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMemorized();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCardFlip, handlePrev, handleNext, toggleReminder, toggleMemorized]);

  if (!currentWordItem) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] rounded-3xl text-sm font-bengali text-[#737885] dark:text-[#8d97ab]">
        কোনো শব্দ পাওয়া যায়নি।
      </div>
    );
  }

  const isChecked = checkedWords.has(wordKey);
  const isReminder = reminderWords.has(wordKey);
  const isMemorized = memorizedWords.has(wordKey);

  return (
    <div className={`w-full max-w-xl mx-auto select-none space-y-3 ${className}`}>
      
      {/* Top Utility Row: "あ Reading" Toggle & Card Navigation Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        
        {/* "あ Reading" toggle above card */}
        <button
          type="button"
          onClick={toggleReadingOnFront}
          aria-pressed={showReadingOnFront}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
            showReadingOnFront
              ? 'bg-[#f5f2eb] dark:bg-[#1a1e2a] border-[#e8e3d8] dark:border-[#222735] text-[#191c21] dark:text-[#f6f8fb]'
              : 'bg-transparent border-dashed border-[#e8e3d8] dark:border-[#222735] text-[#737885] dark:text-[#8d97ab] hover:border-[#c23b22]'
          }`}
          title="কার্ডের সামনে হিরাগানা রিডিং দেখান বা লুকান"
        >
          <span className="font-japanese font-bold text-xs text-[#c23b22]">あ</span>
          <span>Reading:</span>
          <span className="font-semibold">{showReadingOnFront ? 'Visible' : 'Hidden'}</span>
          {showReadingOnFront ? <Eye className="w-3.5 h-3.5 text-[#737885]" /> : <EyeOff className="w-3.5 h-3.5 text-[#737885]" />}
        </button>

        {/* Quick Prev / Next step buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous word"
            className="p-1.5 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-[#737885] dark:text-[#8d97ab] transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
            title="পূর্ববর্তী শব্দ (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next word"
            className="p-1.5 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-[#737885] dark:text-[#8d97ab] transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
            title="পরবর্তী শব্দ (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN 3D FLIPCARD STAGE
         ========================================================================= */}
      <div 
        style={{ perspective: prefersReducedMotion ? undefined : '1200px' }}
        className="w-full relative touch-pan-y"
      >
        <div
          onClick={handleCardFlip}
          role="button"
          tabIndex={0}
          aria-label={`Vocabulary card: ${currentWordItem.word}. Press Space to flip.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardFlip();
            }
          }}
          className={`w-full min-h-[420px] sm:min-h-[460px] relative cursor-pointer select-none rounded-[28px] sm:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
            prefersReducedMotion ? '' : 'transition-transform duration-500'
          }`}
          style={{
            transformStyle: prefersReducedMotion ? undefined : 'preserve-3d',
            transform: prefersReducedMotion 
              ? undefined 
              : isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            WebkitTransform: prefersReducedMotion 
              ? undefined 
              : isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >

          {/* =====================================================================
              CARD FRONT
             ===================================================================== */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_12px_36px_-6px_rgba(25,28,33,0.06),0_1px_3px_rgba(25,28,33,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] p-5 sm:p-7 flex flex-col justify-between text-center overflow-hidden transition-colors duration-200 ${
              isFlipped ? 'pointer-events-none opacity-0 sm:opacity-100' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              zIndex: isFlipped ? 0 : 2,
            }}
          >
            {/* Subtle Japanese Stationery Corner Brackets */}
            <div className="absolute top-3.5 left-3.5 w-3 h-3 border-t border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tl-sm" />
            <div className="absolute top-3.5 right-3.5 w-3 h-3 border-t border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tr-sm" />
            <div className="absolute bottom-3.5 left-3.5 w-3 h-3 border-b border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-bl-sm" />
            <div className="absolute bottom-3.5 right-3.5 w-3 h-3 border-b border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-br-sm" />

            {/* TOP ROW: "Checked", "#3 / 120" counter, "Reminder" */}
            <div className="flex items-center justify-between pt-0.5">
              
              {/* Checked toggle pill */}
              <button
                type="button"
                onClick={toggleChecked}
                aria-pressed={isChecked}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
                  isChecked
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border-[#e8e3d8] dark:border-[#222735] hover:text-[#191c21] dark:hover:text-white'
                }`}
                title="Checked হিসেবে চিহ্নিত করুন"
              >
                <Check className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9ea3b0]'}`} />
                <span>Checked</span>
              </button>

              {/* Counter pill: e.g. "#3 / 120" */}
              <div className="px-3 py-1 rounded-full bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-xs font-mono font-bold text-[#191c21] dark:text-[#f6f8fb]">
                #{currentIndex + 1} / {items.length}
              </div>

              {/* Reminder toggle pill */}
              <button
                type="button"
                onClick={toggleReminder}
                aria-pressed={isReminder}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
                  isReminder
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                    : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border-[#e8e3d8] dark:border-[#222735] hover:text-[#191c21] dark:hover:text-white'
                }`}
                title="Reminder তালিকায় সংরক্ষণ করুন (R)"
              >
                <Bell className={`w-3.5 h-3.5 ${isReminder ? 'fill-amber-500 text-amber-500' : 'text-[#9ea3b0]'}`} />
                <span>Reminder</span>
              </button>
            </div>

            {/* CENTER: Part of speech tag, large word, hiragana reading */}
            <div className="my-auto py-4 flex flex-col items-center justify-center">
              
              {/* Above word: small outlined tag showing part of speech */}
              <div className="mb-3 px-3 py-0.5 rounded-full border border-[#e8e3d8] dark:border-[#222735] bg-[#f5f2eb]/60 dark:bg-[#1a1e2a]/60 text-[11px] font-medium tracking-wide uppercase text-[#737885] dark:text-[#8d97ab]">
                {currentWordItem.partOfSpeech}
              </div>

              {/* Center vocabulary word in large text */}
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-japanese text-[#191c21] dark:text-[#f6f8fb] tracking-tight mb-2 select-text leading-tight">
                {currentWordItem.word}
              </h2>

              {/* Hiragana reading in smaller muted text below (controlled by reading toggle) */}
              {showReadingOnFront && (
                <p className="text-xl sm:text-2xl font-japanese font-medium text-[#737885] dark:text-[#8d97ab] tracking-wide select-text mt-1">
                  {currentWordItem.reading}
                </p>
              )}
            </div>

            {/* BOTTOM LINE: "TAP CARD TO FLIP" and "Space / Flip" */}
            <div className="pt-2 border-t border-[#e8e3d8]/60 dark:border-[#222735]/60 flex items-center justify-between text-xs text-[#9ea3b0] dark:text-[#5d677d]">
              <span className="font-semibold tracking-wider uppercase text-[11px]">
                TAP CARD TO FLIP
              </span>
              <span className="font-mono text-[11px] flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-[10px]">Space</kbd>
                <span>/ Flip</span>
              </span>
            </div>

          </div>

          {/* =====================================================================
              CARD BACK (Exact layout as Kanji card back)
             ===================================================================== */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_12px_36px_-6px_rgba(25,28,33,0.06),0_1px_3px_rgba(25,28,33,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] p-5 sm:p-6 flex flex-col justify-between text-left overflow-y-auto scrollbar-none transition-colors duration-200 ${
              isFlipped ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0 sm:opacity-100'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
              zIndex: isFlipped ? 2 : 0,
            }}
          >
            {/* Subtle Japanese Stationery Corner Brackets */}
            <div className="absolute top-3.5 left-3.5 w-3 h-3 border-t border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tl-sm" />
            <div className="absolute top-3.5 right-3.5 w-3 h-3 border-t border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tr-sm" />
            <div className="absolute bottom-3.5 left-3.5 w-3 h-3 border-b border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-bl-sm" />
            <div className="absolute bottom-3.5 right-3.5 w-3 h-3 border-b border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-br-sm" />

            <div className="space-y-3.5">
              
              {/* 1. HEADER: English meaning in bold, category badge, part-of-speech badge */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#e8e3d8]/80 dark:border-[#222735]/80 pb-3">
                <div className="flex-1 min-w-[160px]">
                  <h3 className="text-lg sm:text-xl font-bold text-[#191c21] dark:text-[#f6f8fb] leading-tight">
                    {currentWordItem.englishMeaning}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Category badge */}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-[11px] font-medium text-[#737885] dark:text-[#8d97ab]">
                    {currentWordItem.category}
                  </span>
                  {/* Part-of-speech badge */}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fdf5f3] dark:bg-[#2c1514] border border-[#f5c6cb] dark:border-[#4d2121] text-[11px] font-bold text-[#c23b22]">
                    {currentWordItem.partOfSpeech}
                  </span>
                </div>
              </div>

              {/* 2. STATUS TOGGLE PILLS: Checked, Reminder, "Memorized?" */}
              <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                
                {/* Checked pill */}
                <button
                  type="button"
                  onClick={toggleChecked}
                  aria-pressed={isChecked}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
                    isChecked
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold'
                      : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border-[#e8e3d8] dark:border-[#222735]'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9ea3b0]'}`} />
                  <span>Checked</span>
                </button>

                {/* Reminder pill */}
                <button
                  type="button"
                  onClick={toggleReminder}
                  aria-pressed={isReminder}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
                    isReminder
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                      : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border-[#e8e3d8] dark:border-[#222735]'
                  }`}
                >
                  <Bell className={`w-3.5 h-3.5 ${isReminder ? 'fill-amber-500 text-amber-500' : 'text-[#9ea3b0]'}`} />
                  <span>Reminder</span>
                </button>

                {/* Memorized? toggle pill */}
                <button
                  type="button"
                  onClick={toggleMemorized}
                  aria-pressed={isMemorized}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden ${
                    isMemorized
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isMemorized ? 'Memorized!' : 'Memorized?'}</span>
                </button>

              </div>

              {/* 3. READING ROW: large reading, romaji in brackets, Listen button */}
              <div 
                className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/70 border border-[#e8e3d8] dark:border-[#222735]"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-japanese text-[#191c21] dark:text-[#f6f8fb]">
                    {currentWordItem.reading}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#966b1e] dark:text-[#d4af37] mt-0.5">
                    [{currentWordItem.romaji}]
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlayReading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#ede8df] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
                  title="জাপানি উচ্চারণ শুনুন (Listen)"
                >
                  <Volume2 className={`w-4 h-4 text-[#c23b22] ${isPlayingWord ? 'animate-pulse' : ''}`} />
                  <span>Listen</span>
                </button>
              </div>

              {/* 4. MEANINGS BOX: "বাংলা অর্থ" in large bold text, then "English: ..." */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-xs">
                <div className="text-[11px] font-bold text-[#737885] dark:text-[#8d97ab] uppercase tracking-wider mb-1 font-bengali">
                  বাংলা অর্থ
                </div>
                <div className="text-xl sm:text-2xl font-black font-bengali text-[#191c21] dark:text-[#f6f8fb] leading-snug">
                  {currentWordItem.banglaMeaning}
                </div>
                <div className="text-xs text-[#737885] dark:text-[#8d97ab] mt-1.5 font-medium">
                  English: <span className="font-semibold text-[#191c21] dark:text-[#f6f8fb]">{currentWordItem.englishMeaning}</span>
                </div>
              </div>

              {/* 5. EXAMPLE BOX: Japanese sentence with Listen button, Bangla bold, English muted */}
              {currentWordItem.example && (
                <div 
                  className="p-3.5 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/70 border border-[#e8e3d8] dark:border-[#222735] shadow-xs space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#737885] dark:text-[#8d97ab] uppercase tracking-wider">
                    <span className="flex items-center gap-1 font-bengali">
                      <BookOpen className="w-3.5 h-3.5 text-[#c5a880]" />
                      উদাহরণ বাক্য (EXAMPLE)
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayExample}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] text-[10px] font-bold text-[#191c21] dark:text-[#f6f8fb] hover:bg-[#f5f2eb] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
                      title="উদাহরণ বাক্য শুনুন"
                    >
                      <Volume2 className="w-3 h-3 text-[#c23b22]" />
                      <span>Listen</span>
                    </button>
                  </div>

                  {/* Japanese sentence */}
                  <p className="text-sm font-japanese font-bold text-[#191c21] dark:text-[#f6f8fb] select-text">
                    {currentWordItem.example.jp}
                  </p>

                  {/* Bangla translation in bold */}
                  <p className="text-xs font-bengali font-bold text-[#191c21] dark:text-[#f6f8fb] select-text">
                    {currentWordItem.example.bangla}
                  </p>

                  {/* English translation in muted text */}
                  <p className="text-xs text-[#737885] dark:text-[#8d97ab] select-text">
                    {currentWordItem.example.english}
                  </p>
                </div>
              )}

              {/* 6. WORD PROFILE BOX: 2-column grid with Level and Type */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735]">
                  <span className="text-[10px] uppercase font-bold text-[#737885] dark:text-[#8d97ab] block mb-0.5">
                    Level
                  </span>
                  <span className="font-mono font-bold text-[#c23b22]">
                    {currentWordItem.level}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735]">
                  <span className="text-[10px] uppercase font-bold text-[#737885] dark:text-[#8d97ab] block mb-0.5">
                    Type
                  </span>
                  <span className="font-medium text-[#191c21] dark:text-[#f6f8fb]">
                    {currentWordItem.partOfSpeech}
                  </span>
                </div>
              </div>

            </div>

            {/* 7. FIXED BOTTOM BUTTON: "Tap to return to front" */}
            <div className="pt-3 border-t border-[#e8e3d8]/80 dark:border-[#222735]/80 mt-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleCardFlip}
                className="w-full py-2.5 px-4 rounded-xl bg-[#191c21] hover:bg-[#2d313a] dark:bg-white dark:hover:bg-[#f6f8fb] text-white dark:text-[#0d0f14] text-xs font-bold font-bengali transition active:scale-98 cursor-pointer shadow-xs flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Tap to return to front</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Nav Row: Previous / Next Card with keyboard shortcuts */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handlePrev}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
          title="পূর্ববর্তী শব্দ (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4 text-[#737885]" />
          <span>পূর্ববর্তী</span>
        </button>

        <span className="text-[11px] font-mono text-[#737885] dark:text-[#8d97ab]">
          {currentIndex + 1} of {items.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#c23b22] focus-visible:outline-hidden"
          title="পরবর্তী শব্দ (Right Arrow)"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-4 h-4 text-[#737885]" />
        </button>
      </div>

    </div>
  );
};
export default VocabularyFlashcard;
