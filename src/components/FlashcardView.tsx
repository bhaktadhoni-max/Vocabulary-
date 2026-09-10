import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  Star, 
  CheckCircle2, 
  BookOpen, 
  Play, 
  Pause, 
  Eye, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { VocabItem } from '../types';
import { CATEGORIES } from '../data/categories';
import { 
  speakJapanese, 
  speakBangla, 
  getVoiceSettings, 
  saveVoiceSettings, 
  playCardFlipSound, 
  playBookmarkSound 
} from '../utils/sound';
import { EmptyState } from './EmptyState';

interface FlashcardViewProps {
  items: VocabItem[];
  allVocab: VocabItem[];
  bookmarkedIds: Set<number>;
  masteredIds: Set<number>;
  onToggleBookmark: (id: number) => void;
  onToggleMastered: (id: number) => void;
  selectedCategory: string;
  onSelectCategory: (categoryKey: string) => void;
  onResetFilters: () => void;
  onOpenVoiceSettings?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  items,
  allVocab,
  bookmarkedIds,
  masteredIds,
  onToggleBookmark,
  onToggleMastered,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
  onOpenVoiceSettings,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showBengaliFront, setShowBengaliFront] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<'ja' | 'bn' | 'ja-ex' | 'bn-ex' | null>(null);
  const [autoSpeakFlip, setAutoSpeakFlip] = useState(() => getVoiceSettings().autoSpeakOnFlip);
  const [sessionCount, setSessionCount] = useState(0);

  // Keep index valid when items list changes
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [items.length, selectedCategory]);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setSessionCount((prev) => prev + 1);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleShuffle = useCallback(() => {
    if (items.length <= 1) return;
    setIsFlipped(false);
    let randomIndex = Math.floor(Math.random() * items.length);
    if (randomIndex === currentIndex) {
      randomIndex = (randomIndex + 1) % items.length;
    }
    setCurrentIndex(randomIndex);
  }, [items.length, currentIndex]);

  const handleJapaneseAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    setPlayingAudio('ja');
    speakJapanese(currentItem.kanji || currentItem.hiragana, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  const handleBanglaAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    setPlayingAudio('bn');
    speakBangla(currentItem.bn, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  const handleJapaneseSentenceAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.exampleJp) return;
    setPlayingAudio('ja-ex');
    speakJapanese(currentItem.exampleJp, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  const handleBanglaSentenceAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.exampleBn) return;
    setPlayingAudio('bn-ex');
    speakBangla(currentItem.exampleBn, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  const handleFlip = useCallback(() => {
    playCardFlipSound();
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && autoSpeakFlip && currentItem) {
        setTimeout(() => {
          if (!showBengaliFront) {
            setPlayingAudio('bn');
            speakBangla(currentItem.bn, {
              onEnd: () => setPlayingAudio(null),
              onError: () => setPlayingAudio(null),
            });
          } else {
            setPlayingAudio('ja');
            speakJapanese(currentItem.kanji || currentItem.hiragana, {
              onEnd: () => setPlayingAudio(null),
              onError: () => setPlayingAudio(null),
            });
          }
        }, 120);
      }
      return next;
    });
  }, [currentItem, showBengaliFront, autoSpeakFlip]);

  const handleToggleAutoSpeak = () => {
    const nextVal = !autoSpeakFlip;
    setAutoSpeakFlip(nextVal);
    saveVoiceSettings({ autoSpeakOnFlip: nextVal });
  };

  const handleBookmarkToggle = useCallback((id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggleBookmark(id);
    if (!bookmarkedIds.has(id)) {
      playBookmarkSound();
    }
  }, [onToggleBookmark, bookmarkedIds]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (
        e.code === 'Space' || 
        e.key === ' ' || 
        e.key === 'Enter' || 
        e.key === 'f' || 
        e.key === 'F' || 
        e.key === 'ArrowUp' || 
        e.key === 'ArrowDown'
      ) {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleJapaneseAudio();
      } else if (e.key === 'b' || e.key === 'B') {
        if (currentItem) {
          e.preventDefault();
          onToggleBookmark(currentItem.id);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (currentItem) {
          e.preventDefault();
          onToggleMastered(currentItem.id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleJapaneseAudio, currentItem, onToggleBookmark, onToggleMastered, handleShuffle]);

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isAutoPlaying && items.length > 0) {
      timer = setInterval(() => {
        setIsFlipped((prev) => {
          if (!prev) {
            return true;
          } else {
            handleNext();
            return false;
          }
        });
      }, 3400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, items.length, handleNext]);

  // Empty State Guard
  if (items.length === 0 || !currentItem) {
    return (
      <EmptyState 
        type="general" 
        onResetFilters={onResetFilters}
        onRestoreAll={onResetFilters}
      />
    );
  }

  const isBookmarked = bookmarkedIds.has(currentItem.id);
  const isMastered = masteredIds.has(currentItem.id);

  return (
    <div id="flashcard-study-container" className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
      
      {/* =========================================================================
          CATEGORY PILLS (Screenshot exact match: Wrapping rounded pills, active dark)
         ========================================================================= */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-4 border-b border-[#e8e2d4]">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-[13px] font-bengali transition-all select-none ${
                  isSelected
                    ? 'bg-[#1e293b] text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-[#e2dcd0] hover:bg-[#f5f1e8] hover:border-slate-300'
                }`}
              >
                {cat.nameBn}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          THE CLEAN FLASHCARD CENTERPIECE (Screenshot exact match)
         ========================================================================= */}
      <div className="max-w-md mx-auto w-full">
        <div 
          id="flashcard-interactive-card"
          className="relative group w-full h-[410px] sm:h-[440px] perspective-1000 cursor-pointer select-none"
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
          aria-label="Flashcard - click or press space to flip"
        >
          {/* Rotator Card */}
          <div 
            className="w-full h-full relative flip-card-inner preserve-3d"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
          >
            {/* FRONT OF CARD */}
            <div 
              className={`absolute inset-0 w-full h-full backface-hidden rounded-[28px] sm:rounded-[32px] bg-white border border-[#e7e1d2] shadow-xs sm:shadow-sm p-6 sm:p-8 flex flex-col justify-between text-center hover:border-[#558b2f]/40 transition-colors duration-300 ${
                isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                zIndex: isFlipped ? 0 : 2,
                opacity: isFlipped ? 0 : 1,
                transition: 'opacity 0.25s ease-in-out, border-color 0.2s',
              }}
            >
              {/* Top Hint / Flip Button */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf8f5] text-slate-500 hover:text-slate-900 border border-[#e8e2d4] hover:border-slate-300 text-xs font-bengali transition cursor-pointer active:scale-95"
                  title="কার্ড উল্টান (Space / F / Enter)"
                >
                  <RotateCw className="w-3 h-3 text-[#558b2f]" />
                  <span>ট্যাপ দিন → উল্টান</span>
                </button>
              </div>

              {/* Center Main Japanese Display */}
              <div className="my-auto py-3">
                {!showBengaliFront ? (
                  <>
                    <h2 className="text-5xl sm:text-6xl font-bold font-japanese text-slate-900 tracking-tight mb-2 select-text">
                      {currentItem.kanji}
                    </h2>
                    <p className="text-xl sm:text-2xl font-semibold font-japanese text-[#558b2f] mb-1 select-text">
                      {currentItem.hiragana}
                    </p>
                    <p className="text-xs font-mono text-slate-400 tracking-wider">
                      [{currentItem.romaji}]
                    </p>

                    {/* Quick Pronunciation Button on Front */}
                    <button
                      type="button"
                      onClick={(e) => handleJapaneseAudio(e)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] text-xs font-medium transition active:scale-95 cursor-pointer"
                      title="জাপানি উচ্চারণ শুনুন (A / J)"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingAudio === 'ja' ? 'animate-bounce' : ''}`} />
                      <span>উচ্চারণ শুনুন</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-[#558b2f] uppercase tracking-wider font-bengali">
                      বাংলা অর্থ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold font-bengali text-slate-900 mt-2 mb-2 select-text">
                      {currentItem.bn}
                    </h2>
                    <p className="text-xs text-slate-400 font-bengali">
                      জাপানি রূপ ও উচ্চারণ দেখতে ট্যাপ করুন
                    </p>
                  </>
                )}
              </div>

              {/* Bottom Hint */}
              <div className="text-xs sm:text-[13px] text-slate-500 font-bengali flex items-center justify-center gap-1.5 pb-1">
                <span>👆</span>
                <span className="underline decoration-dotted underline-offset-4">অর্থ দেখতে ট্যাপ করুন</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div 
              className={`absolute inset-0 w-full h-full backface-hidden rounded-[28px] sm:rounded-[32px] bg-white border border-[#558b2f]/40 shadow-xs sm:shadow-sm p-6 sm:p-8 flex flex-col justify-between text-center transition-colors duration-300 ${
                isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              style={{
                transform: 'rotateY(180deg)',
                WebkitTransform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                zIndex: isFlipped ? 2 : 0,
                opacity: isFlipped ? 1 : 0,
                transition: 'opacity 0.25s ease-in-out, border-color 0.2s',
              }}
            >
              {/* Top Hint / Flip Back Button */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f9ea] text-[#3f6e1f] hover:text-[#284913] border border-[#d6eab9] text-xs font-bengali transition cursor-pointer active:scale-95"
                  title="কার্ড উল্টান (Space / F / Enter)"
                >
                  <RotateCcw className="w-3 h-3 text-[#558b2f]" />
                  <span>ট্যাপ দিন → সামনে ফিরুন</span>
                </button>
              </div>

              {/* Center Meaning & Sentence */}
              <div className="my-auto py-2">
                {!showBengaliFront ? (
                  <>
                    <h2 className="text-3xl sm:text-4xl font-bold font-bengali text-slate-900 mb-2 select-text">
                      {currentItem.bn}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-japanese text-[#558b2f] font-semibold mb-2 flex-wrap">
                      <span>{currentItem.kanji}</span>
                      <span className="text-slate-300">•</span>
                      <span>{currentItem.hiragana}</span>
                      <span className="text-xs font-mono text-slate-400 font-normal">
                        ({currentItem.romaji})
                      </span>
                    </div>

                    {/* Audio buttons */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={(e) => handleJapaneseAudio(e)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] text-xs font-semibold transition active:scale-95 cursor-pointer"
                        title="জাপানি উচ্চারণ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>জাপানি</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleBanglaAudio(e)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
                        title="বাংলা অর্থ উচ্চারণ"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#558b2f]" />
                        <span>বাংলা</span>
                      </button>
                    </div>

                    {/* Example sentence capsule */}
                    {currentItem.exampleJp && (
                      <div 
                        className="bg-[#faf8f5] border border-[#eadecd] rounded-2xl p-3 text-left shadow-2xs mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-bengali">
                          <span className="font-semibold text-[#558b2f] flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            উদাহরণ বাক্য:
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleJapaneseSentenceAudio}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#558b2f] text-slate-700 text-[10px] transition cursor-pointer"
                            >
                              JP বাক্য
                            </button>
                            {currentItem.exampleBn && (
                              <button
                                type="button"
                                onClick={handleBanglaSentenceAudio}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#558b2f] text-slate-700 text-[10px] transition cursor-pointer"
                              >
                                বাংলা
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-japanese text-slate-800 font-medium select-text">
                          {currentItem.exampleFurigana || currentItem.exampleJp}
                        </p>
                        <p className="text-[11px] sm:text-xs font-bengali text-slate-600 mt-0.5 select-text">
                          {currentItem.exampleBn}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl sm:text-5xl font-bold font-japanese text-slate-900 mb-2">
                      {currentItem.kanji}
                    </h2>
                    <p className="text-xl font-japanese text-[#558b2f] mb-1">
                      {currentItem.hiragana}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      [{currentItem.romaji}]
                    </p>
                  </>
                )}
              </div>

              {/* Bottom Hint */}
              <div className="text-xs sm:text-[13px] text-slate-500 font-bengali flex items-center justify-center gap-1.5 pb-1">
                <span>👆</span>
                <span className="underline decoration-dotted underline-offset-4">সামনে ফিরতে ট্যাপ করুন</span>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            BOTTOM FOUR CONTROL BUTTONS (← আগে, উল্টান, Shuffle, পরে →)
           ========================================================================= */}
        <div className="mt-5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Button Left: ← আগে */}
          <button
            id="btn-flashcard-prev"
            onClick={handlePrev}
            className="flex-1 py-3 px-3 sm:px-4 rounded-2xl bg-[#e9ece9] hover:bg-[#dfe4df] text-slate-800 font-bold font-bengali text-xs sm:text-base flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
            title="পূর্ববর্তী শব্দ (Left Arrow)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>আগে</span>
          </button>

          {/* Dedicated Flip Button */}
          <button
            id="btn-flashcard-flip"
            onClick={handleFlip}
            className="py-3 px-3.5 sm:px-4 rounded-2xl bg-white hover:bg-[#f4f9ea] text-slate-800 hover:text-[#3f6e1f] border border-[#e2dcd0] hover:border-[#cce4ab] font-bold font-bengali text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
            title="কার্ড উল্টান (Space / F / Enter)"
          >
            <RotateCw className="w-4 h-4 text-[#558b2f]" />
            <span>উল্টান</span>
          </button>

          {/* Button Middle: Shuffle in Yellow/Gold */}
          <button
            id="btn-flashcard-shuffle"
            onClick={handleShuffle}
            className="py-3 px-3.5 sm:px-4 rounded-2xl bg-[#f6c445] hover:bg-[#eab308] text-white transition active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer"
            title="এলোমেলো শব্দ (Shuffle - R)"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Button Right: পরে → in Green */}
          <button
            id="btn-flashcard-next"
            onClick={handleNext}
            className="flex-1 py-3 px-3 sm:px-4 rounded-2xl bg-[#65a30d] hover:bg-[#558b2f] text-white font-bold font-bengali text-xs sm:text-base flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
            title="পরবর্তী শব্দ (Right Arrow)"
          >
            <span>পরে</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Counter and Category label (Screenshot match: ৫ / ৭৪৮ • অন্যান্য বিশেষ্য) */}
        <div className="mt-3 text-center text-xs text-slate-500 font-bengali">
          <span className="font-mono font-semibold text-slate-700">{currentIndex + 1}</span>
          <span> / </span>
          <span className="font-mono text-slate-500">{items.length}</span>
          <span> • </span>
          <span>{currentItem.category}</span>
        </div>

        {/* Extra Utilities Bar (Star Bookmark, Mastered check, Reverse mode, Autoplay) */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bengali">
          {/* Bookmark Star */}
          <button
            onClick={(e) => handleBookmarkToggle(currentItem.id, e)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 ${
              isBookmarked
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-600 border-[#e5dec9] hover:bg-slate-50'
            }`}
            title="বুকমার্ক করুন (B)"
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}</span>
          </button>

          {/* Mastered Check */}
          <button
            onClick={() => onToggleMastered(currentItem.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 ${
              isMastered
                ? 'bg-[#f4f9ea] text-[#3f6e1f] border-[#cce4ab]'
                : 'bg-white text-slate-600 border-[#e5dec9] hover:bg-slate-50'
            }`}
            title="আয়ত্ত হয়েছে চিহ্নিত করুন (M)"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-[#558b2f]' : ''}`} />
            <span>{isMastered ? 'আয়ত্ত' : 'শেখা শেষ'}</span>
          </button>

          {/* Auto-Speak */}
          <button
            onClick={handleToggleAutoSpeak}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 ${
              autoSpeakFlip
                ? 'bg-[#f4f9ea] text-[#3f6e1f] border-[#cce4ab]'
                : 'bg-white text-slate-600 border-[#e5dec9] hover:bg-slate-50'
            }`}
            title="কার্ড উল্টালে স্বয়ংক্রিয় উচ্চারণ শুনুন"
          >
            <Zap className={`w-3.5 h-3.5 ${autoSpeakFlip ? 'text-[#558b2f] fill-[#558b2f]' : ''}`} />
            <span className="hidden sm:inline">অটো অডিও</span>
          </button>

          {/* Bengali Front Toggle */}
          <button
            onClick={() => setShowBengaliFront((prev) => !prev)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 ${
              showBengaliFront
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-600 border-[#e5dec9] hover:bg-slate-50'
            }`}
            title="বাংলা আগে নাকি জাপানি আগে"
          >
            <Eye className="w-3.5 h-3.5 text-[#558b2f]" />
            <span>{showBengaliFront ? 'বাংলা আগে' : 'জাপানি আগে'}</span>
          </button>

          {/* Autoplay */}
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 ${
              isAutoPlaying
                ? 'bg-[#f4f9ea] text-[#3f6e1f] border-[#cce4ab]'
                : 'bg-white text-slate-600 border-[#e5dec9] hover:bg-slate-50'
            }`}
            title="স্বয়ংক্রিয় স্লাইডশো"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-[#558b2f]" /> : <Play className="w-3.5 h-3.5 text-[#558b2f]" />}
            <span>অটোপ্লে</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="hidden sm:flex items-center justify-center gap-3 mt-3 text-[11px] font-medium text-slate-400 font-mono select-none">
          <span>Space উল্টান</span>
          <span>•</span>
          <span>← / → আগে-পরে</span>
          <span>•</span>
          <span>A উচ্চারণ</span>
          <span>•</span>
          <span>B বুকমার্ক</span>
          <span>•</span>
          <span>M শেখা শেষ</span>
        </div>

      </div>

      {/* =========================================================================
          FOOTER ATTRIBUTION (Screenshot match)
         ========================================================================= */}
      <div className="mt-14 pt-8 text-center text-xs text-slate-400 font-bengali space-y-1">
        <p>
          Wasabee Bangladesh • JLPT N5 — ৮৩৮টি অপরিহার্য শব্দ
        </p>
        <p className="text-slate-400/80">
          Tanos শব্দতালিকা অনুসারে • বাংলাভাষীদের জন্য
        </p>
      </div>

    </div>
  );
};
