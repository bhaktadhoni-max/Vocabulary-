import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  Star, 
  Check, 
  X, 
  RotateCcw,
  BookOpen, 
  Play, 
  Pause, 
  Eye, 
  Zap, 
  Keyboard, 
  AlertCircle,
  Turtle,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { N4VocabItem, ReviewRating, N4Status } from '../../data/n4/types';
import { N4_CATEGORIES, N4_LESSONS_META } from '../../data/n4';
import { 
  speakJapanese, 
  speakBangla, 
  getVoiceSettings, 
  saveVoiceSettings, 
  playCardFlipSound, 
  playBookmarkSound,
  playSuccessChime,
  playReviewSound
} from '../../utils/sound';

interface N4FlashcardViewProps {
  items: N4VocabItem[];
  favoriteIds: Set<number>;
  statusMap: Map<number, N4Status>;
  masteredIds?: Set<number>;
  onToggleFavorite: (id: number) => void;
  onMarkStudied: (id: number) => void;
  onMarkReview: (id: number, rating: ReviewRating) => void;
  selectedLesson: number | 'all';
  onSelectLesson: (lesson: number | 'all') => void;
  onOpenVoiceSettings?: () => void;
  activeLevel?: 'N4' | 'N5';
  onSwitchLevel?: (level: 'N4' | 'N5') => void;
}

export const N4FlashcardView: React.FC<N4FlashcardViewProps> = ({
  items,
  favoriteIds,
  statusMap,
  masteredIds = new Set(),
  onToggleFavorite,
  onMarkStudied,
  onMarkReview,
  selectedLesson,
  onSelectLesson,
  activeLevel = 'N4',
  onSwitchLevel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isShuffled, setIsShuffled] = useState(false);
  const [isShufflingAnim, setIsShufflingAnim] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([0]);
  const [historyPos, setHistoryPos] = useState(0);
  const [seenCardIds, setSeenCardIds] = useState<Set<number>>(new Set());
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('');

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showBengaliFront, setShowBengaliFront] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<'ja' | 'bn' | 'ja-ex' | 'bn-ex' | null>(null);
  const [autoSpeakFlip, setAutoSpeakFlip] = useState(() => getVoiceSettings().autoSpeakOnFlip);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [recentActionFeedback, setRecentActionFeedback] = useState<'know' | 'dont_know' | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  // Audio rapid click debounce
  const lastAudioClickRef = useRef<number>(0);

  // 3D physics tilt & mouse tracking
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltSpringConfig = { damping: 28, stiffness: 220, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), tiltSpringConfig);
  const rotateYHover = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), tiltSpringConfig);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleCardMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Filter items by selected lesson & category
  const filteredList = useMemo(() => {
    let list = items;
    if (selectedLesson !== 'all') {
      list = list.filter(item => item.lesson === selectedLesson);
    }
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'expressions') {
        list = list.filter(item => item.categoryKey === 'expressions' || item.categoryKey === 'others');
      } else {
        list = list.filter(item => item.categoryKey === selectedCategory);
      }
    }
    return list;
  }, [items, selectedLesson, selectedCategory]);

  // Reset index & seen state when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
    setShuffleHistory([0]);
    setHistoryPos(0);
    if (filteredList.length > 0 && filteredList[0]) {
      setSeenCardIds(new Set([filteredList[0].id]));
    } else {
      setSeenCardIds(new Set());
    }
  }, [selectedLesson, selectedCategory, filteredList.length]);

  const currentItem: N4VocabItem | undefined = filteredList[currentIndex];

  // Record studied state
  useEffect(() => {
    if (currentItem) {
      onMarkStudied(currentItem.id);
      setSeenCardIds((prev) => {
        if (prev.has(currentItem.id)) return prev;
        const next = new Set(prev);
        next.add(currentItem.id);
        return next;
      });
    }
  }, [currentItem, onMarkStudied]);

  // Flip card
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => {
      const next = !prev;
      playCardFlipSound();

      if (next && autoSpeakFlip && currentItem) {
        setTimeout(() => {
          speakJapanese(currentItem.kanji || currentItem.hiragana);
        }, 120);
      }
      return next;
    });
  }, [autoSpeakFlip, currentItem]);

  // Safe Audio Speaking
  const handleJapaneseAudio = useCallback((e?: React.MouseEvent, slow: boolean = false) => {
    e?.stopPropagation();
    const now = Date.now();
    if (now - lastAudioClickRef.current < 350) return;
    lastAudioClickRef.current = now;

    if (!currentItem) return;
    const text = currentItem.kanji || currentItem.hiragana;
    setPlayingAudio('ja');
    speakJapanese(text, {
      rate: slow ? 0.65 : undefined,
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null)
    });
  }, [currentItem]);

  const handleBanglaAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const now = Date.now();
    if (now - lastAudioClickRef.current < 350) return;
    lastAudioClickRef.current = now;

    if (!currentItem) return;
    setPlayingAudio('bn');
    speakBangla(currentItem.bn, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null)
    });
  }, [currentItem]);

  const handleJapaneseSentenceAudio = useCallback((e?: React.MouseEvent, slow: boolean = false) => {
    e?.stopPropagation();
    if (!currentItem?.exampleJp) return;
    const now = Date.now();
    if (now - lastAudioClickRef.current < 350) return;
    lastAudioClickRef.current = now;

    setPlayingAudio('ja-ex');
    speakJapanese(currentItem.exampleJp, {
      rate: slow ? 0.7 : undefined,
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null)
    });
  }, [currentItem]);

  const handleBanglaSentenceAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.exampleBn) return;
    const now = Date.now();
    if (now - lastAudioClickRef.current < 350) return;
    lastAudioClickRef.current = now;

    setPlayingAudio('bn-ex');
    speakBangla(currentItem.exampleBn, {
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null)
    });
  }, [currentItem]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredList.length === 0) return;
    setIsFlipped(false);
    playCardFlipSound();

    if (isShuffled) {
      if (historyPos < shuffleHistory.length - 1) {
        const nextPos = historyPos + 1;
        setHistoryPos(nextPos);
        setCurrentIndex(shuffleHistory[nextPos]);
      } else {
        const unvisitedIndices: number[] = [];
        for (let i = 0; i < filteredList.length; i++) {
          if (!seenCardIds.has(filteredList[i].id)) {
            unvisitedIndices.push(i);
          }
        }
        let nextIndex: number;
        if (unvisitedIndices.length > 0) {
          nextIndex = unvisitedIndices[Math.floor(Math.random() * unvisitedIndices.length)];
        } else {
          nextIndex = Math.floor(Math.random() * filteredList.length);
        }
        setShuffleHistory(prev => [...prev, nextIndex]);
        setHistoryPos(prev => prev + 1);
        setCurrentIndex(nextIndex);
      }
    } else {
      setCurrentIndex(prev => (prev + 1) % filteredList.length);
    }
  }, [filteredList, isShuffled, historyPos, shuffleHistory, seenCardIds]);

  const handlePrev = useCallback(() => {
    if (filteredList.length === 0) return;
    setIsFlipped(false);
    playCardFlipSound();

    if (isShuffled) {
      if (historyPos > 0) {
        const prevPos = historyPos - 1;
        setHistoryPos(prevPos);
        setCurrentIndex(shuffleHistory[prevPos]);
      }
    } else {
      setCurrentIndex(prev => (prev - 1 + filteredList.length) % filteredList.length);
    }
  }, [filteredList.length, isShuffled, historyPos, shuffleHistory]);

  // Shuffle toggle
  const handleShuffle = useCallback(() => {
    if (filteredList.length <= 1) return;
    setIsShufflingAnim(true);
    setTimeout(() => setIsShufflingAnim(false), 500);

    const randomIndex = Math.floor(Math.random() * filteredList.length);
    setIsShuffled(true);
    setShuffleHistory([randomIndex]);
    setHistoryPos(0);
    setCurrentIndex(randomIndex);
    setIsFlipped(false);
    playCardFlipSound();
  }, [filteredList.length]);

  const handleResetToSequential = useCallback(() => {
    setIsShuffled(false);
    setShuffleHistory([currentIndex]);
    setHistoryPos(0);
    playCardFlipSound();
  }, [currentIndex]);

  // Action: Know / Mastered
  const handleActionKnow = useCallback(() => {
    if (!currentItem) return;
    onMarkReview(currentItem.id, 'good');
    playSuccessChime();
    setRecentActionFeedback('know');
    setTimeout(() => setRecentActionFeedback(null), 500);
    handleNext();
  }, [currentItem, onMarkReview, handleNext]);

  // Action: Don't Know / Need Practice
  const handleActionDontKnow = useCallback(() => {
    if (!currentItem) return;
    onMarkReview(currentItem.id, 'again');
    playReviewSound();
    setRecentActionFeedback('dont_know');
    setTimeout(() => setRecentActionFeedback(null), 500);
    setReviewNotice('📌 "Needs Practice" তালিকায় যুক্ত হয়েছে');
    setTimeout(() => setReviewNotice(null), 2500);
    handleNext();
  }, [currentItem, onMarkReview, handleNext]);

  // Bookmark toggle
  const handleBookmarkToggle = useCallback((id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggleFavorite(id);
    if (!favoriteIds.has(id)) {
      playBookmarkSound();
    }
  }, [onToggleFavorite, favoriteIds]);

  // Auto-play slideshow timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoPlaying && filteredList.length > 0) {
      timer = setInterval(() => {
        if (!isFlipped) {
          setIsFlipped(true);
          playCardFlipSound();
          if (currentItem) {
            speakJapanese(currentItem.kanji || currentItem.hiragana);
          }
        } else {
          handleNext();
        }
      }, 3400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, isFlipped, filteredList.length, handleNext, currentItem]);

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
      } else if (e.key === '1' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleActionDontKnow();
      } else if (e.key === '2' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleActionKnow();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'j' || e.key === 'J' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleJapaneseAudio();
      } else if (e.key === 'b' || e.key === 'B') {
        if (currentItem) {
          e.preventDefault();
          handleBookmarkToggle(currentItem.id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleActionKnow, handleActionDontKnow, handleJapaneseAudio, currentItem, handleBookmarkToggle, handleShuffle]);

  // Empty State Guard
  if (filteredList.length === 0 || !currentItem) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-[#141720] rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-sm space-y-4">
        <p className="text-[#191c21] dark:text-[#f6f8fb] font-bengali font-bold text-base">
          এই ফিল্টারে কোনো JLPT N4 শব্দ পাওয়া যায়নি
        </p>
        <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">
          অন্য কোনো লেসন বা ধরন নির্বাচন করুন অথবা সব শব্দ দেখুন
        </p>
        <button
          onClick={() => {
            onSelectLesson('all');
            setSelectedCategory('all');
          }}
          className="px-5 py-2.5 rounded-xl bg-[#c23b22] hover:bg-[#ab301a] dark:bg-[#e0452d] dark:hover:bg-[#f0523a] text-white text-xs font-bold font-bengali transition cursor-pointer shadow-xs"
        >
          সব N4 শব্দে ফিরুন ({items.length} শব্দ)
        </button>
      </div>
    );
  }

  const isBookmarked = favoriteIds.has(currentItem.id);
  const isMastered = masteredIds.has(currentItem.id) || statusMap.get(currentItem.id) === 'mastered';
  const isLearning = statusMap.get(currentItem.id) === 'learning' || statusMap.get(currentItem.id) === 'review';
  const displayCardNumber = currentIndex + 1;
  const uniqueSeenCount = seenCardIds.size;
  const progressPercent = Math.min(100, Math.round((uniqueSeenCount / filteredList.length) * 100));

  return (
    <div className="max-w-xl mx-auto space-y-3.5">
      
      {/* =========================================================================
          PROMINENT JLPT LEVEL SELECTOR TAB (N4 ALL VOCAB vs N5)
         ========================================================================= */}
      {onSwitchLevel && (
        <div className="p-1.5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 pl-2">
            <Layers className="w-4 h-4 text-[#c23b22] dark:text-[#e0452d]" />
            <span className="text-xs font-bengali font-bold text-[#191c21] dark:text-[#f6f8fb]">
              ফ্ল্যাশকার্ড লেভেল:
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* JLPT N4 (All Vocab) - Active */}
            <button
              type="button"
              onClick={() => onSwitchLevel('N4')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLevel === 'N4'
                  ? 'bg-[#c23b22] dark:bg-[#e0452d] text-white shadow-xs'
                  : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#cbd3e1] hover:bg-[#ede8df]'
              }`}
            >
              <span className="font-mono font-black text-sm">JLPT N4</span>
              <span className="font-bengali text-[11px] font-semibold opacity-95">
                (অল শব্দ • {items.length})
              </span>
            </button>

            {/* JLPT N5 Switcher */}
            <button
              type="button"
              onClick={() => onSwitchLevel('N5')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLevel === 'N5'
                  ? 'bg-[#c23b22] dark:bg-[#e0452d] text-white shadow-xs'
                  : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#cbd3e1] hover:bg-[#ede8df]'
              }`}
            >
              <span className="font-mono font-black text-sm">JLPT N5</span>
              <span className="font-bengali text-[11px] font-semibold opacity-95">
                (৮৯১ শব্দ)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          LESSON SELECTOR & QUICK FILTER BAR
         ========================================================================= */}
      <div className="bg-white dark:bg-[#141720] p-3 rounded-2xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Lesson Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="n4-lesson-picker" className="text-xs font-bengali font-bold text-[#191c21] dark:text-[#f6f8fb] flex items-center gap-1.5">
            <span>লেসন:</span>
          </label>
          <select
            id="n4-lesson-picker"
            value={selectedLesson}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
              onSelectLesson(val);
            }}
            className="text-xs bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] rounded-xl px-2.5 py-1.5 font-bengali font-bold focus:outline-hidden cursor-pointer"
          >
            <option value="all">🌟 সব লেসন (Lesson 26–50) • সকল {items.length} শব্দ</option>
            {N4_LESSONS_META.map(meta => (
              <option key={meta.lesson} value={meta.lesson}>
                লেসন {meta.lesson}: {meta.titleBn} ({meta.count} শব্দ)
              </option>
            ))}
          </select>
        </div>

        {/* Quick Reset to All Vocab if filtered */}
        {selectedLesson !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectLesson('all')}
            className="px-2.5 py-1 rounded-lg text-xs font-bengali font-bold text-[#c23b22] dark:text-[#e0452d] bg-[#c23b22]/10 dark:bg-[#e0452d]/15 border border-[#c23b22]/30 hover:bg-[#c23b22] hover:text-white transition cursor-pointer"
          >
            সব {items.length} শব্দে ফিরুন
          </button>
        )}

        {/* Shuffle & Slideshow Quick Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bengali font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isAutoPlaying
                ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14]'
                : 'border-[#e8e3d8] dark:border-[#222735] text-[#737885] dark:text-[#8d97ab] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
            }`}
            title={isAutoPlaying ? "অটোপ্লে বন্ধ করুন" : "অটোপ্লে স্লাইডশো শুরু করুন"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'অটোপ্লে বন্ধ' : 'অটোপ্লে'}</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          CATEGORY FILTER PILLS (HORIZONTAL SCROLL)
         ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {N4_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = cat.key === 'all' 
            ? (selectedLesson === 'all' ? items.length : items.filter(v => v.lesson === selectedLesson).length)
            : items.filter(v => (selectedLesson === 'all' || v.lesson === selectedLesson) && (cat.key === 'expressions' ? (v.categoryKey === 'expressions' || v.categoryKey === 'others') : v.categoryKey === cat.key)).length;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bengali transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#141720] text-[#474b54] dark:text-[#cbd3e1] border border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
              }`}
            >
              <span>{cat.nameBn}</span>
              <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full tabular-nums ${
                isSelected 
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' 
                  : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Review Notice Toast */}
      {reviewNotice && (
        <div className="px-3.5 py-2 rounded-xl bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] text-xs font-bengali font-semibold shadow-md animate-fadeInScale text-center">
          {reviewNotice}
        </div>
      )}

      {/* =========================================================================
          PROGRESS TRACKER, JUMP DIALOG, SHUFFLE & STATUS
         ========================================================================= */}
      <div className="bg-white dark:bg-[#141720] rounded-2xl p-3 sm:p-3.5 border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] space-y-2.5 transition-colors">
        <div className="flex items-center justify-between gap-2 text-xs">
          
          {/* Left: Card counter & jump dialog */}
          <div className="flex items-center gap-2">
            {isJumpOpen ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = parseInt(jumpValue, 10);
                  if (!isNaN(target) && target >= 1 && target <= filteredList.length) {
                    const targetIndex = target - 1;
                    setCurrentIndex(targetIndex);
                    setIsFlipped(false);
                    setIsShuffled(false);
                  }
                  setIsJumpOpen(false);
                  setJumpValue('');
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="number"
                  min={1}
                  max={filteredList.length}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  placeholder={`${displayCardNumber}`}
                  className="w-16 px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-[#0d0f14] border border-[#c5a880] rounded-lg text-center focus:outline-hidden"
                  autoFocus
                  onBlur={() => setIsJumpOpen(false)}
                />
                <button
                  type="submit"
                  className="text-[10px] px-2 py-1 bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] rounded-lg font-bengali font-semibold cursor-pointer"
                >
                  যান
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsJumpOpen(true);
                  setJumpValue(String(displayCardNumber));
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] dark:hover:bg-[#222738] border border-[#e8e3d8] dark:border-[#222735] group/jump cursor-pointer transition text-left"
                title="নির্দিষ্ট কার্ড নম্বরে যেতে ক্লিক করুন"
              >
                <span className="text-[#737885] dark:text-[#8d97ab] font-bengali text-xs">কার্ড</span>
                <span className="font-mono text-sm font-bold text-[#191c21] dark:text-[#f6f8fb] group-hover/jump:text-[#c23b22] dark:group-hover/jump:text-[#e0452d]">
                  {displayCardNumber}
                </span>
                <span className="text-[#9ea3b0] dark:text-[#5d677d] font-mono text-xs">/ {filteredList.length}</span>
              </button>
            )}

            {/* Shuffle Mode Button */}
            {isShuffled ? (
              <button
                type="button"
                onClick={handleResetToSequential}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bengali font-bold bg-[#c23b22] hover:bg-[#ab301a] dark:bg-[#e0452d] dark:hover:bg-[#f0523a] text-white shadow-xs cursor-pointer transition active:scale-95"
                title="শাফেল বন্ধ করে স্বাভাবিক ক্রমে ফিরুন (S)"
              >
                <Shuffle className="w-3 h-3 text-white shrink-0 animate-spin" />
                <span>শাফেল অন</span>
                <span className="text-[10px] underline font-normal opacity-90">ক্রমে ফিরুন</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bengali font-semibold text-[#474b54] dark:text-[#cbd3e1] bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer active:scale-95 group/shuf"
                title="এলোমেলো ক্রমে শব্দ দেখতে শাফেল করুন (R)"
              >
                <Shuffle className={`w-3 h-3 text-[#c5a880] transition-transform duration-300 ${isShufflingAnim ? 'rotate-180' : 'group-hover:rotate-45'}`} />
                <span>শাফেল</span>
              </button>
            )}
          </div>

          {/* Right: Bookmark & Mastery Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Star Bookmark */}
            <button
              type="button"
              onClick={(e) => handleBookmarkToggle(currentItem.id, e)}
              className={`p-2 rounded-xl transition active:scale-90 cursor-pointer ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-500/10 border border-amber-500/30'
                  : 'text-[#9ea3b0] hover:text-amber-500 hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
              }`}
              title="সংরক্ষণ / বুকমার্ক (B)"
              aria-label="Bookmark this word"
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Status Badge */}
            {isMastered ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bengali font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>আয়ত্ত</span>
              </span>
            ) : isLearning ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bengali font-bold bg-[#c23b22]/10 text-[#c23b22] dark:text-[#e0452d] border border-[#c23b22]/25">
                <AlertCircle className="w-3 h-3 text-[#c23b22] dark:text-[#e0452d]" />
                <span>অনুশীলন</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bengali font-medium bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735]">
                <span>নতুন</span>
              </span>
            )}
          </div>
        </div>

        {/* Minimal Progress Line with Vermilion / Gold Gradient */}
        <div>
          <div className="w-full h-1 bg-[#f5f2eb] dark:bg-[#1a1e2a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c23b22] via-[#c5a880] to-[#d4af37] rounded-full transition-all duration-300"
              style={{ width: `${filteredList.length > 0 ? Math.max(1, (uniqueSeenCount / filteredList.length) * 100) : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-1.5 px-0.5">
            <span>দেখা হয়েছে: {uniqueSeenCount} / {filteredList.length} ({progressPercent}%)</span>
            <span>আয়ত্ত: {masteredIds.size} শব্দ</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TACTILE 3D INTERACTIVE FLIP CARD (JAPANESE MINIMALIST AESTHETIC)
         ========================================================================= */}
      <motion.div 
        key={currentItem?.id}
        initial={{ opacity: 0.8, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="relative w-full"
      >
        <motion.div 
          ref={cardContainerRef}
          id="flashcard-interactive-card"
          className="relative group w-full h-[400px] sm:h-[430px] cursor-pointer select-none"
          style={{ perspective: 1400 }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ scale: { type: 'spring', stiffness: 350, damping: 22 } }}
          aria-label="Flashcard - click or press space to flip"
        >
          {/* Action Pop Feedback Layer */}
          <AnimatePresence>
            {recentActionFeedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                className={`absolute inset-0 z-30 rounded-[28px] sm:rounded-[32px] pointer-events-none flex items-center justify-center ${
                  recentActionFeedback === 'know' 
                    ? 'bg-emerald-500/15 border-2 border-emerald-500' 
                    : 'bg-[#c23b22]/15 dark:bg-[#e0452d]/15 border-2 border-[#c23b22] dark:border-[#e0452d]'
                }`}
              >
                <motion.span 
                  initial={{ y: 8, scale: 0.9 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                  className={`text-sm font-bold font-bengali px-4 py-2 rounded-xl shadow-lg text-white ${
                    recentActionFeedback === 'know' ? 'bg-emerald-600' : 'bg-[#c23b22] dark:bg-[#e0452d]'
                  }`}
                >
                  {recentActionFeedback === 'know' ? '✓ আয়ত্ত চিহ্নিত হয়েছে' : '✕ আবার অনুশীলন করা হবে'}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mouse Tilt Spring Layer */}
          <motion.div
            style={{
              rotateX,
              rotateY: rotateYHover,
              transformStyle: 'preserve-3d',
            }}
            className="w-full h-full relative"
          >
            {/* Primary 3D Physics Flip Rotator */}
            <motion.div 
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                rotateY: isFlipped ? 180 : 0,
                scale: isFlipped ? [1, 1.025, 1] : [1, 1.025, 1],
                z: isFlipped ? [0, 35, 0] : [0, 35, 0],
              }}
              transition={{
                rotateY: { type: 'spring', stiffness: 220, damping: 20, mass: 0.8 },
                scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                z: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              
              {/* =================================================================
                  CARD FRONT: JAPANESE DOMINANT (KANJI + HIRAGANA + AUDIO)
                 ================================================================= */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_12px_36px_-6px_rgba(25,28,33,0.06),0_1px_3px_rgba(25,28,33,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col justify-between text-center overflow-hidden transition-colors duration-200 ${
                  isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                  WebkitTransform: 'rotateY(0deg)',
                  zIndex: isFlipped ? 0 : 2,
                }}
              >
                {/* Corner Stationery Brackets */}
                <div className="absolute top-3.5 left-3.5 w-3 h-3 border-t border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tl-sm" />
                <div className="absolute top-3.5 right-3.5 w-3 h-3 border-t border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tr-sm" />
                <div className="absolute bottom-3.5 left-3.5 w-3 h-3 border-b border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-bl-sm" />
                <div className="absolute bottom-3.5 right-3.5 w-3 h-3 border-b border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-br-sm" />

                {/* Top: Lesson Info & Flip Hint */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] text-xs font-bold border border-[#e8e3d8] dark:border-[#222735]">
                    <span className="text-[#c23b22] dark:text-[#e0452d]">JLPT N4</span>
                    <span className="text-[#9ea3b0] dark:text-[#5d677d]">•</span>
                    <span className="font-bengali font-semibold">লেসন {currentItem.lesson}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#474b54] dark:text-[#cbd3e1] text-xs font-bengali font-medium border border-[#e8e3d8] dark:border-[#222735]">
                    <RotateCw className="w-3 h-3 text-[#c5a880]" />
                    <span>ট্যাপ করে অর্থ দেখুন</span>
                  </span>
                </div>

                {/* Center: Dominant Word Display */}
                <div className="my-auto py-2">
                  {!showBengaliFront ? (
                    <>
                      {/* Dominant Japanese Kanji */}
                      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-japanese text-[#191c21] dark:text-[#f6f8fb] tracking-tight mb-2 select-text leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                        {currentItem.kanji || currentItem.hiragana}
                      </h2>
                      
                      {/* Reading (Hiragana) */}
                      <p className="text-2xl sm:text-3xl font-bold font-japanese text-[#474b54] dark:text-[#cbd3e1] mb-1.5 select-text">
                        {currentItem.hiragana}
                      </p>
                      
                      {/* Romaji */}
                      <p className="text-xs sm:text-sm font-mono tracking-widest text-[#966b1e] dark:text-[#d4af37] uppercase font-semibold">
                        [{currentItem.romaji}]
                      </p>

                      {/* Audio Controls Container */}
                      <div className="mt-5 flex items-center justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleJapaneseAudio(e, false)}
                          className={`inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                            playingAudio === 'ja' ? 'ring-2 ring-[#c23b22] dark:ring-[#e0452d]' : ''
                          }`}
                          title="জাপানি উচ্চারণ শুনুন (A / J / S)"
                        >
                          {playingAudio === 'ja' ? (
                            <div className="flex items-center gap-0.5 h-4">
                              <span className="w-0.5 bg-[#c23b22] dark:bg-[#e0452d] animate-wave-1 rounded-full" />
                              <span className="w-0.5 bg-[#c23b22] dark:bg-[#e0452d] animate-wave-2 rounded-full" />
                              <span className="w-0.5 bg-[#c23b22] dark:bg-[#e0452d] animate-wave-3 rounded-full" />
                            </div>
                          ) : (
                            <Volume2 className="w-4 h-4 text-[#c23b22] dark:text-[#e0452d]" />
                          )}
                          <span>উচ্চারণ শুনুন</span>
                        </button>

                        {/* Slow Audio 0.65x */}
                        <button
                          type="button"
                          onClick={(e) => handleJapaneseAudio(e, true)}
                          className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-2xl bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
                          title="ধীর উচ্চারণ (Slow 0.65x)"
                        >
                          <Turtle className="w-3.5 h-3.5 text-[#737885] dark:text-[#8d97ab]" />
                          <span className="text-[11px] font-mono font-bold">0.65x</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-[#737885] dark:text-[#8d97ab] uppercase tracking-wider font-bengali">
                        বাংলা অর্থ
                      </span>
                      <h2 className="text-3xl sm:text-5xl font-black font-bengali text-[#191c21] dark:text-white mt-2 mb-2 select-text">
                        {currentItem.bn}
                      </h2>
                      <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">
                        জাপানি শব্দ ও উচ্চারণ দেখতে ট্যাপ করুন
                      </p>
                    </>
                  )}
                </div>

                {/* Bottom Gesture Hint */}
                <div className="text-xs text-[#9ea3b0] dark:text-[#5d677d] font-bengali flex items-center justify-center gap-1.5 pb-0.5 font-medium">
                  <span>স্পেস চাপুন অথবা কার্ডে ক্লিক করুন</span>
                </div>
              </div>

              {/* =================================================================
                  CARD BACK: BANGLA MEANING + AUDIO + EXAMPLE SENTENCE
                 ================================================================= */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_12px_36px_-6px_rgba(25,28,33,0.06),0_1px_3px_rgba(25,28,33,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] p-5 sm:p-7 flex flex-col justify-between text-center overflow-hidden transition-colors duration-200 ${
                  isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  WebkitTransform: 'rotateY(180deg)',
                  zIndex: isFlipped ? 2 : 0,
                }}
              >
                {/* Corner Stationery Brackets */}
                <div className="absolute top-3.5 left-3.5 w-3 h-3 border-t border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tl-sm" />
                <div className="absolute top-3.5 right-3.5 w-3 h-3 border-t border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-tr-sm" />
                <div className="absolute bottom-3.5 left-3.5 w-3 h-3 border-b border-l border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-bl-sm" />
                <div className="absolute bottom-3.5 right-3.5 w-3 h-3 border-b border-r border-[#c5a880]/40 dark:border-[#c5a880]/50 pointer-events-none rounded-br-sm" />

                {/* Top: Lesson Info & Return Button */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] text-xs font-bold border border-[#e8e3d8] dark:border-[#222735]">
                    <span className="text-[#c23b22] dark:text-[#e0452d]">JLPT N4</span>
                    <span className="text-[#9ea3b0] dark:text-[#5d677d]">•</span>
                    <span className="font-bengali font-semibold">লেসন {currentItem.lesson}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#191c21] hover:bg-[#2d313a] dark:bg-white dark:hover:bg-[#f6f8fb] text-white dark:text-[#0d0f14] text-xs font-bengali font-bold transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>সামনে ফিরুন</span>
                  </button>
                </div>

                {/* Center: Meaning & Example */}
                <div className="my-auto py-1">
                  {!showBengaliFront ? (
                    <>
                      {/* Primary Bengali Meaning */}
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-bengali text-[#191c21] dark:text-white mb-2 select-text leading-tight">
                        {currentItem.bn}
                      </h2>
                      
                      {/* Word Reading recap */}
                      <div className="flex items-center justify-center gap-2 text-base font-japanese text-[#474b54] dark:text-[#cbd3e1] font-bold mb-3 flex-wrap">
                        <span>{currentItem.kanji || currentItem.hiragana}</span>
                        <span className="text-[#9ea3b0]">•</span>
                        <span>{currentItem.hiragana}</span>
                        <span className="text-xs font-mono text-[#966b1e] dark:text-[#d4af37] font-semibold">
                          ({currentItem.romaji})
                        </span>
                      </div>

                      {/* Pronunciation Buttons Row */}
                      <div className="flex items-center justify-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleJapaneseAudio(e, false)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                          title="জাপানি উচ্চারণ"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#c23b22] dark:text-[#e0452d]" />
                          <span>জাপানি শুনুন</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleBanglaAudio(e)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                          title="বাংলা উচ্চারণ"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>বাংলা শুনুন</span>
                        </button>
                      </div>

                      {/* Context / Note if available */}
                      {currentItem.context && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#474b54] dark:text-[#cbd3e1] border border-[#e8e3d8] dark:border-[#222735] text-xs font-japanese mb-2">
                          <Info className="w-3 h-3 text-[#c5a880] shrink-0" />
                          <span>{currentItem.context}</span>
                        </div>
                      )}

                      {/* Example Sentence Box */}
                      {currentItem.exampleJp && (
                        <div 
                          className="bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/70 border border-[#e8e3d8] dark:border-[#222735] rounded-2xl p-3 sm:p-3.5 text-left shadow-xs text-[#191c21] dark:text-[#f6f8fb]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#737885] dark:text-[#8d97ab] mb-1.5 font-bengali">
                            <span className="font-bold text-[#191c21] dark:text-[#f6f8fb] flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-[#c5a880]" />
                              উদাহরণ বাক্য:
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleJapaneseSentenceAudio(e, false)}
                                className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] text-[#191c21] dark:text-[#f6f8fb] text-[10px] font-semibold transition cursor-pointer"
                                title="জাপানি বাক্য উচ্চারণ"
                              >
                                JP বাক্য
                              </button>
                              {currentItem.exampleBn && (
                                <button
                                  type="button"
                                  onClick={(e) => handleBanglaSentenceAudio(e)}
                                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] text-[#191c21] dark:text-[#f6f8fb] text-[10px] font-semibold transition cursor-pointer"
                                  title="বাংলা অনুবাদ উচ্চারণ"
                                >
                                  বাংলা
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-japanese text-[#191c21] dark:text-[#f6f8fb] font-bold select-text">
                            {currentItem.exampleFurigana || currentItem.exampleJp}
                          </p>
                          {currentItem.exampleRomaji && (
                            <p className="text-[10px] font-mono text-[#966b1e] dark:text-[#d4af37] mt-0.5 select-text">
                              {currentItem.exampleRomaji}
                            </p>
                          )}
                          <p className="text-xs font-bengali text-[#474b54] dark:text-[#cbd3e1] font-medium mt-1 select-text">
                            {currentItem.exampleBn}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl sm:text-5xl font-black font-japanese text-[#191c21] dark:text-white mb-2">
                        {currentItem.kanji || currentItem.hiragana}
                      </h2>
                      <p className="text-xl font-bold font-japanese text-[#474b54] dark:text-[#cbd3e1] mb-1">
                        {currentItem.hiragana}
                      </p>
                      <p className="text-xs font-mono text-[#966b1e] dark:text-[#d4af37]">
                        [{currentItem.romaji}]
                      </p>
                    </>
                  )}
                </div>

                {/* Bottom Return Hint */}
                <div className="text-xs text-[#9ea3b0] dark:text-[#5d677d] font-bengali flex items-center justify-center gap-1.5 pb-0.5 font-medium">
                  <span>সামনে ফিরতে ট্যাপ করুন</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =========================================================================
          PRIMARY LEARNING ACTION BAR (❌ জানিনা • 🔄 উল্টান • ✅ জানি)
         ========================================================================= */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        
        {/* Action 1: Don't Know / Need Practice */}
        <button
          id="btn-flashcard-dont-know"
          onClick={handleActionDontKnow}
          className="min-h-[50px] py-3 px-2 sm:px-3 rounded-2xl bg-white dark:bg-[#141720] hover:bg-[#c23b22]/5 dark:hover:bg-[#e0452d]/10 text-[#474b54] hover:text-[#c23b22] dark:text-[#cbd3e1] dark:hover:text-[#f0523a] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/40 dark:hover:border-[#e0452d]/40 font-bold font-bengali text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer group"
          title="শব্দটি আবার অনুশীলন করা হবে (1 / X)"
        >
          <X className="w-4 h-4 text-[#9ea3b0] group-hover:text-[#c23b22] dark:group-hover:text-[#e0452d] transition-colors" />
          <span>জানিনা</span>
        </button>

        {/* Action 2: Flip Card */}
        <button
          id="btn-flashcard-flip"
          onClick={handleFlip}
          className="min-h-[50px] py-3 px-2 sm:px-3 rounded-2xl bg-[#191c21] hover:bg-[#2d313a] dark:bg-white dark:hover:bg-[#f6f8fb] text-white dark:text-[#0d0f14] font-bold font-bengali text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer group"
          title="কার্ড উল্টান (Space / F)"
        >
          <RotateCw className="w-4 h-4 text-[#c5a880] group-hover:rotate-180 transition-transform duration-500" />
          <span>উল্টান</span>
        </button>

        {/* Action 3: Know / Mastered */}
        <button
          id="btn-flashcard-know"
          onClick={handleActionKnow}
          className="min-h-[50px] py-3 px-2 sm:px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-bengali text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer group"
          title="আয়ত্ত হয়েছে চিহ্নিত করুন (2 / C)"
        >
          <Check className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>জানি</span>
        </button>
      </div>

      {/* =========================================================================
          SECONDARY NAVIGATION ROW (← আগে • 🔀 শাফেল • পরে →)
         ========================================================================= */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {/* Previous Card */}
        <button
          id="btn-flashcard-prev"
          onClick={handlePrev}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] font-bold font-bengali text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          title="পূর্ববর্তী শব্দ (Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4 text-[#737885] dark:text-[#8d97ab]" />
          <span>আগে</span>
        </button>

        {/* Shuffle & Sequential Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-flashcard-shuffle"
            onClick={handleShuffle}
            className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bengali font-bold cursor-pointer ${
              isShuffled
                ? 'bg-[#c23b22] hover:bg-[#ab301a] dark:bg-[#e0452d] dark:hover:bg-[#f0523a] text-white shadow-xs'
                : 'bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] shadow-xs'
            }`}
            title="নতুন এলোমেলো শব্দে যান (R)"
          >
            <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${isShufflingAnim ? 'rotate-180' : ''}`} />
            <span>{isShuffled ? 'নতুন শাফেল' : 'শাফেল'}</span>
          </button>

          {isShuffled && (
            <button
              id="btn-flashcard-to-sequential"
              type="button"
              onClick={handleResetToSequential}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] text-[#474b54] dark:text-[#cbd3e1] border border-[#e8e3d8] dark:border-[#222735] transition active:scale-95 cursor-pointer text-xs font-bengali font-semibold flex items-center gap-1 shadow-xs"
              title="শাফেল বন্ধ করে স্বাভাবিক ক্রমে ফিরুন (S)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#737885]" />
              <span className="hidden sm:inline">ক্রমিক</span>
            </button>
          )}
        </div>

        {/* Next Card */}
        <button
          id="btn-flashcard-next"
          onClick={handleNext}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-white dark:bg-[#141720] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] font-bold font-bengali text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          title="পরবর্তী শব্দ (Right Arrow)"
        >
          <span>পরে</span>
          <ArrowRight className="w-4 h-4 text-[#737885] dark:text-[#8d97ab]" />
        </button>
      </div>

      {/* =========================================================================
          STUDY PREFERENCES TOOLBAR
         ========================================================================= */}
      <div className="mt-4 p-1.5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] flex items-center justify-around gap-1 text-xs font-bengali shadow-xs">
        
        {/* Auto-Speak on Flip */}
        <button
          onClick={() => {
            const next = !autoSpeakFlip;
            setAutoSpeakFlip(next);
            saveVoiceSettings({ autoSpeakOnFlip: next });
          }}
          className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer ${
            autoSpeakFlip 
              ? 'bg-[#c23b22]/10 dark:bg-[#e0452d]/15 text-[#c23b22] dark:text-[#e0452d] font-bold border border-[#c23b22]/30' 
              : 'text-[#737885] dark:text-[#8d97ab] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
          }`}
          title="কার্ড উল্টালে স্বয়ংক্রিয় জাপানি উচ্চারণ শুনুন"
        >
          <Zap className={`w-3.5 h-3.5 ${autoSpeakFlip ? 'text-[#c23b22] dark:text-[#e0452d] fill-current' : 'text-[#737885]'}`} />
          <span>অটো অডিও</span>
        </button>

        {/* Toggle Bengali Front / Japanese Front */}
        <button
          onClick={() => setShowBengaliFront(!showBengaliFront)}
          className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer ${
            showBengaliFront 
              ? 'bg-[#c5a880]/15 text-[#966b1e] dark:text-[#d4af37] font-bold border border-[#c5a880]/30' 
              : 'text-[#737885] dark:text-[#8d97ab] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
          }`}
          title="সামনে বাংলা বা জাপানি শব্দ পরিবর্তন করুন"
        >
          <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
          <span>{showBengaliFront ? 'বাংলা আগে' : 'জাপানি আগে'}</span>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="min-h-[38px] flex items-center gap-1.5 px-3 py-1 rounded-xl text-[#737885] dark:text-[#8d97ab] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] transition cursor-pointer"
          title="কীবোর্ড শর্টকাট দেখুন"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>শর্টকাট</span>
        </button>
      </div>

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#141720] rounded-3xl border border-[#e8e3d8] dark:border-[#222735] p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e8e3d8] dark:border-[#222735]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#c23b22] dark:text-[#e0452d]" />
                <h3 className="font-bold font-bengali text-sm text-[#191c21] dark:text-[#f6f8fb]">
                  কীবোর্ড শর্টকাট
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] text-[#737885]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bengali">
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">কার্ড উল্টান (Flip)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#1a1e2a] border font-bold">Space / Enter / F</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">পরবর্তী শব্দ (Next)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#1a1e2a] border font-bold">→ (Right Arrow)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">পূর্ববর্তী শব্দ (Prev)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#1a1e2a] border font-bold">← (Left Arrow)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">জানি (Mastered)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">2 / C</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">জানিনা (Practice)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#c23b22]/10 text-[#c23b22] dark:text-[#e0452d] border border-[#c23b22]/30 font-bold">1 / X</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#f5f2eb] dark:border-[#1a1e2a]">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">জাপানি উচ্চারণ শুনুন</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#1a1e2a] border font-bold">S / A / J</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#474b54] dark:text-[#cbd3e1]">বুকমার্ক / সংরক্ষণ</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#1a1e2a] border font-bold">B</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2 rounded-xl bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] text-xs font-bengali font-bold cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
