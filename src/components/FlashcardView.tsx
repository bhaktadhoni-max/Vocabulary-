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
  Filter,
  Play,
  Pause,
  Palette,
  Eye,
  Flame,
  Zap,
  VolumeX
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

// 5 Luxury High-Contrast Color Themes
export type CardGradientTheme = 'aurora' | 'sakura' | 'cyber' | 'emerald' | 'velvet';

interface GradientThemeConfig {
  id: CardGradientTheme;
  nameBn: string;
  glowFront: string;
  glowBack: string;
  frontBg: string;
  frontBorder: string;
  frontAccent: string;
  frontKana: string;
  backBg: string;
  backBorder: string;
  backAccent: string;
  backKana: string;
  badgeBg: string;
  btnGradient: string;
  previewDots: string;
}

const GRADIENT_THEMES: Record<CardGradientTheme, GradientThemeConfig> = {
  aurora: {
    id: 'aurora',
    nameBn: 'কসমিক অরোরা',
    glowFront: 'from-blue-600/25 via-indigo-600/15 to-cyan-500/25',
    glowBack: 'from-cyan-500/35 via-blue-600/25 to-indigo-600/35',
    frontBg: 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95',
    frontBorder: 'border-slate-800/80 hover:border-cyan-500/40',
    frontAccent: 'text-cyan-400',
    frontKana: 'text-cyan-300',
    backBg: 'bg-gradient-to-br from-slate-950 via-[#07192f] to-[#041226]',
    backBorder: 'border-cyan-500/40 hover:border-cyan-400/60',
    backAccent: 'text-cyan-400',
    backKana: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    btnGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400',
    previewDots: 'from-blue-500 to-cyan-400',
  },
  sakura: {
    id: 'sakura',
    nameBn: 'সানসেট সাকুরা',
    glowFront: 'from-rose-600/25 via-pink-600/15 to-amber-500/25',
    glowBack: 'from-rose-500/35 via-purple-600/25 to-amber-500/35',
    frontBg: 'bg-gradient-to-br from-slate-900/95 via-stone-900/90 to-slate-950/95',
    frontBorder: 'border-slate-800/80 hover:border-rose-500/40',
    frontAccent: 'text-rose-400',
    frontKana: 'text-rose-300',
    backBg: 'bg-gradient-to-br from-slate-950 via-[#260c1d] to-[#1c0817]',
    backBorder: 'border-rose-500/40 hover:border-pink-400/60',
    backAccent: 'text-rose-400',
    backKana: 'text-pink-300',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    btnGradient: 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400',
    previewDots: 'from-rose-500 to-amber-400',
  },
  cyber: {
    id: 'cyber',
    nameBn: 'নিয়ন সাইবার',
    glowFront: 'from-violet-600/25 via-purple-600/15 to-fuchsia-500/25',
    glowBack: 'from-fuchsia-500/35 via-purple-600/25 to-cyan-400/35',
    frontBg: 'bg-gradient-to-br from-slate-900/95 via-purple-950/40 to-slate-950/95',
    frontBorder: 'border-slate-800/80 hover:border-purple-500/40',
    frontAccent: 'text-fuchsia-400',
    frontKana: 'text-purple-300',
    backBg: 'bg-gradient-to-br from-slate-950 via-[#1e0a2d] to-[#0d041a]',
    backBorder: 'border-fuchsia-500/40 hover:border-purple-400/60',
    backAccent: 'text-fuchsia-400',
    backKana: 'text-purple-300',
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
    btnGradient: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-500 hover:to-pink-400',
    previewDots: 'from-purple-500 to-fuchsia-400',
  },
  emerald: {
    id: 'emerald',
    nameBn: 'জেন এমারেল্ড',
    glowFront: 'from-emerald-600/25 via-teal-600/15 to-cyan-500/25',
    glowBack: 'from-teal-500/35 via-emerald-600/25 to-lime-500/35',
    frontBg: 'bg-gradient-to-br from-slate-900/95 via-teal-950/30 to-slate-950/95',
    frontBorder: 'border-slate-800/80 hover:border-emerald-500/40',
    frontAccent: 'text-emerald-400',
    frontKana: 'text-emerald-300',
    backBg: 'bg-gradient-to-br from-slate-950 via-[#06201a] to-[#031310]',
    backBorder: 'border-emerald-500/40 hover:border-teal-400/60',
    backAccent: 'text-emerald-400',
    backKana: 'text-teal-300',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    btnGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400',
    previewDots: 'from-emerald-500 to-teal-400',
  },
  velvet: {
    id: 'velvet',
    nameBn: 'মিডনাইট ভেলভেট',
    glowFront: 'from-indigo-600/25 via-slate-700/15 to-blue-500/25',
    glowBack: 'from-indigo-500/35 via-blue-700/25 to-sky-400/35',
    frontBg: 'bg-gradient-to-br from-slate-900/95 via-indigo-950/30 to-slate-950/95',
    frontBorder: 'border-slate-800/80 hover:border-indigo-500/40',
    frontAccent: 'text-indigo-400',
    frontKana: 'text-indigo-300',
    backBg: 'bg-gradient-to-br from-slate-950 via-[#0c132c] to-[#060a18]',
    backBorder: 'border-indigo-500/40 hover:border-blue-400/60',
    backAccent: 'text-indigo-400',
    backKana: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    btnGradient: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400',
    previewDots: 'from-indigo-500 to-blue-400',
  }
};

const THEME_STORAGE_KEY = 'jlpt_flashcard_gradient_theme';
const SESSION_COUNT_KEY = 'jlpt_session_reviewed_count';

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
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<'ja' | 'bn' | 'ja-ex' | 'bn-ex' | null>(null);
  const [showBengaliFront, setShowBengaliFront] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeakFlip, setAutoSpeakFlip] = useState<boolean>(() => {
    return getVoiceSettings().autoSpeakOnFlip;
  });
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_COUNT_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [gradientTheme, setGradientTheme] = useState<CardGradientTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as CardGradientTheme;
      if (saved && GRADIENT_THEMES[saved]) return saved;
    } catch {
      // fallback
    }
    return 'aurora';
  });

  const handleSelectTheme = (theme: CardGradientTheme) => {
    setGradientTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    setShowThemePicker(false);
  };

  const themeConfig = GRADIENT_THEMES[gradientTheme] || GRADIENT_THEMES.aurora;

  // Safe clamp index if items change
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [items.length]);

  const currentItem: VocabItem | undefined = items[currentIndex];

  const trackSessionProgress = () => {
    setSessionCount((prev) => {
      const next = prev + 1;
      try {
        sessionStorage.setItem(SESSION_COUNT_KEY, next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    trackSessionProgress();
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleShuffle = useCallback(() => {
    if (items.length <= 1) return;
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * items.length);
    setCurrentIndex(randomIndex);
    trackSessionProgress();
  }, [items.length]);

  // Japanese word audio
  const handleJapaneseAudio = useCallback((e?: React.MouseEvent, slow = false) => {
    e?.stopPropagation();
    if (!currentItem) return;
    setPlayingAudio('ja');
    speakJapanese(currentItem.hiragana || currentItem.kanji, {
      slow,
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  // Bangla meaning audio
  const handleBanglaAudio = useCallback((e?: React.MouseEvent, slow = false) => {
    e?.stopPropagation();
    if (!currentItem) return;
    setPlayingAudio('bn');
    speakBangla(currentItem.bn, {
      slow,
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  // Context-aware audio: speaks the visible language on the active side of the card
  const handleCurrentSideAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFlipped) {
      // BACK OF CARD
      if (!showBengaliFront) {
        handleBanglaAudio(e);
      } else {
        handleJapaneseAudio(e);
      }
    } else {
      // FRONT OF CARD
      if (!showBengaliFront) {
        handleJapaneseAudio(e);
      } else {
        handleBanglaAudio(e);
      }
    }
  }, [isFlipped, showBengaliFront, handleBanglaAudio, handleJapaneseAudio]);

  // Japanese sentence audio
  const handleJapaneseSentenceAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.exampleJp) return;
    setPlayingAudio('ja-ex');
    speakJapanese(currentItem.exampleJp, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  // Bangla sentence audio
  const handleBanglaSentenceAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.exampleBn) return;
    setPlayingAudio('bn-ex');
    speakBangla(currentItem.exampleBn, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, [currentItem]);

  // Card Flip with automatic contextual sound
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev;
      playCardFlipSound();

      // Auto-pronounce visible language upon flip if auto-speak is enabled
      const settings = getVoiceSettings();
      if ((settings.autoSpeakOnFlip || autoSpeakFlip) && currentItem) {
        setTimeout(() => {
          if (next) {
            // Flipped to BACK:
            if (!showBengaliFront) {
              // Back is Bangla -> Speak Bangla!
              setPlayingAudio('bn');
              speakBangla(currentItem.bn, {
                onEnd: () => setPlayingAudio(null),
                onError: () => setPlayingAudio(null),
              });
            } else {
              // Back is Japanese -> Speak Japanese!
              setPlayingAudio('ja');
              speakJapanese(currentItem.hiragana || currentItem.kanji, {
                onEnd: () => setPlayingAudio(null),
                onError: () => setPlayingAudio(null),
              });
            }
          } else {
            // Flipped to FRONT:
            if (!showBengaliFront) {
              // Front is Japanese -> Speak Japanese!
              setPlayingAudio('ja');
              speakJapanese(currentItem.hiragana || currentItem.kanji, {
                onEnd: () => setPlayingAudio(null),
                onError: () => setPlayingAudio(null),
              });
            } else {
              // Front is Bangla -> Speak Bangla!
              setPlayingAudio('bn');
              speakBangla(currentItem.bn, {
                onEnd: () => setPlayingAudio(null),
                onError: () => setPlayingAudio(null),
              });
            }
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

  // Keyboard navigation & audio shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleCurrentSideAudio();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleJapaneseAudio();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleBanglaAudio();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleShuffle();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleCurrentSideAudio, handleJapaneseAudio, handleBanglaAudio, currentItem, onToggleBookmark, onToggleMastered, handleShuffle]);

  // Auto-play slideshow timer
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
      }, 3200);
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
  const progressPercent = Math.round(((currentIndex + 1) / items.length) * 100);

  return (
    <div id="flashcard-study-container" className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      
      {/* =========================================================================
          SLEEK TOP TOOLBAR: Category Filter & Essential Switches
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        
        {/* Category Pill Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            id="flashcard-category-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none font-bengali cursor-pointer w-full"
          >
            <option value="all" className="bg-slate-950 text-slate-200">সব বিষয়ভিত্তিক শব্দ ({allVocab.length})</option>
            {CATEGORIES.filter(c => c.key !== 'all').map((cat) => {
              const count = allVocab.filter((v) => v.categoryKey === cat.key).length;
              return (
                <option key={cat.key} value={cat.key} className="bg-slate-950 text-slate-200">
                  {cat.icon} {cat.nameBn} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Right Utility Pills: Theme Picker, JP/BN Mode & Autoplay */}
        <div className="flex items-center justify-end gap-2 relative">
          
          {/* Gradient Palette Theme Dropdown */}
          <div className="relative">
            <button
              id="btn-flashcard-gradient-theme"
              onClick={() => setShowThemePicker((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
              title="থিম ও রঙ পরিবর্তন"
            >
              <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${themeConfig.previewDots} ring-1 ring-white/20`} />
              <span className="font-bengali hidden sm:inline">{themeConfig.nameBn}</span>
              <Palette className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showThemePicker && (
              <div 
                className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-bengali border-b border-slate-800/80 mb-1">
                  কালার থিম নির্বাচন
                </div>
                <div className="space-y-1">
                  {(Object.keys(GRADIENT_THEMES) as CardGradientTheme[]).map((themeKey) => {
                    const item = GRADIENT_THEMES[themeKey];
                    const isSelected = gradientTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => handleSelectTheme(themeKey)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isSelected 
                            ? 'bg-slate-800 text-white font-bold ring-1 ring-white/20' 
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${item.previewDots}`} />
                          <span className="font-bengali">{item.nameBn}</span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Auto-Speak on Flip Quick Switch */}
          <button
            id="btn-toggle-auto-speak"
            onClick={handleToggleAutoSpeak}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition ${
              autoSpeakFlip
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
            title="কার্ড উল্টালে স্বয়ংক্রিয় উচ্চারণ শুনুন (Auto Speak on Flip)"
          >
            <Zap className={`w-3.5 h-3.5 ${autoSpeakFlip ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-500'}`} />
            <span className="font-bengali hidden sm:inline">{autoSpeakFlip ? 'অটো অডিও: অন' : 'অটো অডিও'}</span>
          </button>

          {/* Bengali Front / Japanese Front Toggle Pill */}
          <button
            id="btn-toggle-front-mode"
            onClick={() => setShowBengaliFront((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition ${
              showBengaliFront
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="সামনে বাংলা নাকি জাপানি প্রদর্শিত হবে পরিবর্তন করুন"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bengali">{showBengaliFront ? 'বাংলা আগে' : 'জাপানি আগে'}</span>
          </button>

          {/* Autoplay Slideshow Pill */}
          <button
            id="btn-autoplay"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition ${
              isAutoPlaying
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
            title="স্বয়ংক্রিয় স্লাইডশো"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="font-bengali hidden sm:inline">{isAutoPlaying ? 'অটোপ্লে' : 'অটোপ্লে'}</span>
          </button>

        </div>
      </div>

      {/* =========================================================================
          SESSION PROGRESS & CARD COUNTER BAR
         ========================================================================= */}
      <div className="mb-4 bg-slate-900/60 backdrop-blur-md rounded-2xl p-2.5 px-4 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        
        {/* Left: Card Index Counter & Session Activity */}
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-cyan-400 text-sm">
            #{currentIndex + 1} <span className="text-slate-500 font-normal">/ {items.length}</span>
          </span>
          
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bengali">সেশন রিভিশন: <strong className="text-slate-200 font-mono">{sessionCount}</strong> শব্দ</span>
          </div>
        </div>

        {/* Right: Thin Glowing Progress Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs justify-end">
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <div 
              className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${themeConfig.btnGradient}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">{progressPercent}%</span>
        </div>

      </div>

      {/* =========================================================================
          3D FLIPCARD WITH HARDWARE-ACCELERATED SPRING ROTATION & GRADIENTS
         ========================================================================= */}
      <div 
        className="relative group w-full h-[380px] sm:h-[410px] perspective-1000 cursor-pointer select-none"
        onClick={handleFlip}
      >
        {/* Dynamic Multi-Color Ambient Glow Halo */}
        <div 
          className={`absolute -inset-1.5 rounded-[36px] blur-xl transition-all duration-700 ease-out opacity-40 group-hover:opacity-70 bg-gradient-to-r ${
            isFlipped ? themeConfig.glowBack : themeConfig.glowFront
          }`} 
        />

        {/* 3D Rotator Card */}
        <div 
          className={`w-full h-full relative flip-card-inner duration-700 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ===================================================================
              FRONT OF CARD (Clean, High-Typography, No Clutter)
             =================================================================== */}
          <div 
            className={`absolute inset-0 w-full h-full backface-hidden rounded-[32px] ${themeConfig.frontBg} backdrop-blur-2xl border ${themeConfig.frontBorder} shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-500`}
          >
            {/* Front Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeConfig.badgeBg}`}>
                {currentItem.category} • #{currentItem.id}
              </span>

              {/* Front Quick Audio Pill (Sounds Japanese in standard mode, Bangla in reverse mode) */}
              <button
                id="btn-card-front-audio"
                onClick={!showBengaliFront ? (e) => handleJapaneseAudio(e) : (e) => handleBanglaAudio(e)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all active:scale-95 ${
                  (!showBengaliFront && playingAudio === 'ja') || (showBengaliFront && playingAudio === 'bn')
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-cyan-400 border-slate-800 hover:border-cyan-500/40'
                }`}
                title={!showBengaliFront ? 'জাপানি উচ্চারণ শুনুন (A / S)' : 'বাংলা অর্থ শুনুন (A / S)'}
              >
                <Volume2 className={`w-4 h-4 ${((!showBengaliFront && playingAudio === 'ja') || (showBengaliFront && playingAudio === 'bn')) ? 'animate-bounce text-cyan-300' : ''}`} />
                <span className="text-[11px] font-bengali font-semibold">
                  {!showBengaliFront ? 'জাপানি উচ্চারণ' : 'বাংলা শুনুন'}
                </span>
              </button>
            </div>

            {/* Front Center Word Display */}
            <div className="relative z-10 text-center my-auto py-2">
              {!showBengaliFront ? (
                <>
                  <h2 className="text-6xl sm:text-7xl font-bold font-japanese text-white tracking-tight mb-3 drop-shadow-md">
                    {currentItem.kanji}
                  </h2>
                  <p className={`text-2xl sm:text-3xl font-light font-japanese ${themeConfig.frontKana} mb-2 tracking-wider`}>
                    {currentItem.hiragana}
                  </p>
                  <p className="text-sm font-mono text-slate-400 tracking-widest">
                    [{currentItem.romaji}]
                  </p>
                </>
              ) : (
                <>
                  <div className={`text-[11px] uppercase tracking-widest ${themeConfig.frontAccent} font-bold mb-2`}>
                    বাংলা অর্থ
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold font-bengali text-white mb-3 leading-tight drop-shadow-md">
                    {currentItem.bn}
                  </h2>
                  <p className="text-xs text-slate-400 font-bengali">
                    জাপানি শব্দ ও উচ্চারণ দেখতে কার্ডে চাপুন
                  </p>
                </>
              )}
            </div>

            {/* Front Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-[11px]">JLPT N5</span>
              <div className="flex items-center gap-1.5 text-slate-400 font-bengali text-xs">
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>অর্থ দেখতে উল্টান (Space / Tap)</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">#{currentIndex + 1}</span>
            </div>
          </div>

          {/* ===================================================================
              BACK OF CARD (Revealed Meaning & Bangla Pronunciation)
             =================================================================== */}
          <div 
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[32px] ${themeConfig.backBg} backdrop-blur-2xl text-white border ${themeConfig.backBorder} shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-500`}
          >
            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${themeConfig.badgeBg} font-bengali border`}>
                {currentItem.category}
              </span>

              {/* Back Primary Audio Pill (Speaks Bangla in standard mode, Japanese in reverse mode) */}
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-card-back-audio"
                  onClick={!showBengaliFront ? (e) => handleBanglaAudio(e) : (e) => handleJapaneseAudio(e)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all active:scale-95 ${
                    (!showBengaliFront && playingAudio === 'bn') || (showBengaliFront && playingAudio === 'ja')
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950/85 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                  }`}
                  title={!showBengaliFront ? 'বাংলা অর্থ উচ্চারণ শুনুন' : 'জাপানি উচ্চারণ শুনুন'}
                >
                  <Volume2 className={`w-4 h-4 ${((!showBengaliFront && playingAudio === 'bn') || (showBengaliFront && playingAudio === 'ja')) ? 'animate-bounce text-emerald-300' : ''}`} />
                  <span className="text-[11px] font-bengali font-semibold">
                    {!showBengaliFront ? 'বাংলা উচ্চারণ' : 'জাপানি উচ্চারণ'}
                  </span>
                </button>
              </div>
            </div>

            {/* Back Main Content */}
            <div className="relative z-10 my-auto py-2">
              {!showBengaliFront ? (
                <>
                  <div className="text-center mb-3">
                    <span className={`text-[11px] uppercase tracking-widest ${themeConfig.backAccent} font-bold font-bengali`}>
                      বাংলা অর্থ
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-bold font-bengali text-white mt-1 mb-2 drop-shadow-md">
                      {currentItem.bn}
                    </h2>
                    
                    {/* Pronunciation & Japanese Audio Bar */}
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-japanese flex-wrap">
                      <span className="font-bold text-white text-base">{currentItem.kanji}</span>
                      <span className="text-slate-600">•</span>
                      <span className={themeConfig.backKana}>{currentItem.hiragana}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-xs text-slate-400">[{currentItem.romaji}]</span>
                      
                      {/* Secondary Japanese Quick Audio Chip */}
                      <button
                        id="btn-card-back-ja-audio"
                        onClick={(e) => handleJapaneseAudio(e)}
                        className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition flex items-center gap-1 ${
                          playingAudio === 'ja'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border-slate-800'
                        }`}
                        title="জাপানি উচ্চারণ শুনুন (J)"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>JP</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-3">
                    <h2 className="text-4xl sm:text-6xl font-bold font-japanese text-white mt-1 mb-1.5 drop-shadow-md">
                      {currentItem.kanji}
                    </h2>
                    <p className={`text-xl ${themeConfig.backKana} font-japanese`}>
                      {currentItem.hiragana} <span className="text-slate-400 font-mono text-sm">({currentItem.romaji})</span>
                    </p>
                  </div>
                </>
              )}

              {/* Example sentence capsule with both Japanese & Bangla Audio */}
              {currentItem.exampleJp && (
                <div 
                  className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-800/90 mt-2 text-left shadow-inner"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-bengali">
                    <span className={`font-semibold ${themeConfig.backAccent} flex items-center gap-1.5 text-xs`}>
                      <BookOpen className="w-3.5 h-3.5" />
                      বাক্যে প্রয়োগ:
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Japanese sentence audio */}
                      <button
                        onClick={handleJapaneseSentenceAudio}
                        className={`px-2 py-0.5 rounded-lg border transition flex items-center gap-1 text-[11px] font-mono ${
                          playingAudio === 'ja-ex'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-800'
                        }`}
                        title="জাপানি বাক্য শুনুন"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>JP বাক্য</span>
                      </button>

                      {/* Bangla sentence audio */}
                      {currentItem.exampleBn && (
                        <button
                          onClick={handleBanglaSentenceAudio}
                          className={`px-2 py-0.5 rounded-lg border transition flex items-center gap-1 text-[11px] font-bengali ${
                            playingAudio === 'bn-ex'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border-slate-800'
                          }`}
                          title="বাংলা অর্থ শুনুন"
                        >
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>বাংলা বাক্য</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-japanese text-slate-100 font-medium mb-1">
                    {currentItem.exampleFurigana || currentItem.exampleJp}
                  </p>
                  <p className="text-xs font-bengali text-slate-300 leading-relaxed">
                    {currentItem.exampleBn}
                  </p>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-[11px]">JLPT N5</span>
              <span className="font-bengali text-slate-400 text-xs">সামনে যেতে আবার ট্যাপ করুন</span>
              <span className="font-mono text-[11px] text-slate-500">#{currentIndex + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          UNIFIED USER-FRIENDLY BOTTOM CONTROL DOCK (Clean, High-Precision)
         ========================================================================= */}
      <div className="mt-6 max-w-xl mx-auto w-full">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-2.5 sm:p-3 shadow-2xl shadow-black/50 flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left Actions: Shuffle & Star Bookmark */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Shuffle */}
            <button
              id="btn-flashcard-shuffle"
              onClick={handleShuffle}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all active:scale-90"
              title="এলোমেলো শব্দ (Shuffle - R)"
            >
              <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Bookmark */}
            <button
              id="btn-flashcard-bookmark-bottom"
              onClick={(e) => handleBookmarkToggle(currentItem.id, e)}
              className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border transition-all active:scale-90 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border-slate-800 hover:border-amber-500/30'
              }`}
              title={isBookmarked ? 'সংরক্ষিত (Bookmarked - B)' : 'বুকমার্ক করুন (Bookmark - B)'}
            >
              <Star className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Center Navigation: Prev, Flip Centerpiece, Next */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center max-w-xs">
            {/* Prev */}
            <button
              id="btn-flashcard-prev"
              onClick={handlePrev}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/30 transition-all active:scale-90"
              title="পূর্ববর্তী শব্দ (Left Arrow)"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Hero Flip Button */}
            <button
              id="btn-flashcard-flip-main"
              onClick={handleFlip}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-5 rounded-2xl ${themeConfig.btnGradient} text-white font-bold text-xs sm:text-sm shadow-lg shadow-black/40 border border-white/20 transition-all active:scale-95 hover:scale-[1.02] font-bengali tracking-wide`}
              title="কার্ড উল্টান (Space to Flip)"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{isFlipped ? 'সামনে যান' : 'অর্থ দেখুন'}</span>
            </button>

            {/* Next */}
            <button
              id="btn-flashcard-next"
              onClick={handleNext}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/30 transition-all active:scale-90"
              title="পরবর্তী শব্দ (Right Arrow)"
            >
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Right Action: Learned / Mastered Toggle */}
          <div className="flex items-center shrink-0">
            <button
              id="btn-flashcard-mastered-bottom"
              onClick={() => onToggleMastered(currentItem.id)}
              className={`flex items-center gap-1.5 px-3 h-10 sm:h-11 rounded-2xl border transition-all active:scale-90 ${
                isMastered
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950/80 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-300 border-slate-800 hover:border-emerald-500/30'
              }`}
              title={isMastered ? 'আয়ত্ত করা শব্দ (Learned - M)' : 'মুখস্ত হয়েছে চিহ্নিত করুন (M)'}
            >
              <CheckCircle2 className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline font-bengali text-xs font-semibold">
                {isMastered ? 'আয়ত্ত' : 'শেখা শেষ'}
              </span>
            </button>
          </div>

        </div>

        {/* Minimalist Keyboard Shortcuts Guide */}
        <div className="hidden sm:flex items-center justify-center gap-3 mt-3 text-[11px] font-medium text-slate-500 font-mono select-none">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">Space</kbd> উল্টান
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">← / →</kbd> নেভিগেট
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">A</kbd> উচ্চারণ
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">M</kbd> আয়ত্ত
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">B</kbd> বুকমার্ক
          </span>
        </div>
      </div>

    </div>
  );
};
