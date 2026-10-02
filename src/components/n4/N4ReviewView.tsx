import React, { useState, useMemo, useCallback } from 'react';
import { 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  Clock, 
  Award, 
  ArrowRight,
  Star
} from 'lucide-react';
import { N4VocabItem, ReviewRating, N4Status, N4ReviewRecord } from '../../data/n4/types';
import { speakJapanese } from '../../utils/sound';

interface N4ReviewViewProps {
  dueItems: N4VocabItem[];
  allLearningItems: N4VocabItem[];
  reviews: Record<number, N4ReviewRecord>;
  favoriteIds: Set<number>;
  onMarkReview: (id: number, rating: ReviewRating) => void;
  onToggleFavorite: (id: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const N4ReviewView: React.FC<N4ReviewViewProps> = ({
  dueItems,
  allLearningItems,
  reviews,
  favoriteIds,
  onMarkReview,
  onToggleFavorite,
  onNavigateTab
}) => {
  const [includeAllLearning, setIncludeAllLearning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);

  const activeQueue = useMemo(() => {
    if (includeAllLearning) {
      return allLearningItems.length > 0 ? allLearningItems : dueItems;
    }
    return dueItems;
  }, [includeAllLearning, allLearningItems, dueItems]);

  const currentItem = activeQueue[currentIndex];

  const handleRating = (rating: ReviewRating) => {
    if (!currentItem) return;
    onMarkReview(currentItem.id, rating);
    setIsAnswerShown(false);
    if (currentIndex + 1 < activeQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(activeQueue.length);
    }
  };

  // When all reviews completed
  if (!currentItem || activeQueue.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] font-bengali space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[#191c21] dark:text-[#f6f8fb]">
          সব রিভিউ সম্পন্ন হয়েছে!
        </h3>
        <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] max-w-sm mx-auto">
          আজকের জন্য কোনো শব্দ পর্যালোচনার অপেক্ষায় নেই। নতুন শব্দ শিখুন অথবা পুরোনো শব্দগুলো ঝালিয়ে নিন।
        </p>

        <div className="pt-3 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigateTab('flashcards')}
            className="px-5 py-2.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-md shadow-[#c23b22]/20"
          >
            <Layers className="w-4 h-4" />
            <span>নতুন শব্দ পড়ুন</span>
          </button>

          {allLearningItems.length > 0 && !includeAllLearning && (
            <button
              onClick={() => {
                setIncludeAllLearning(true);
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] font-bold text-xs sm:text-sm border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
            >
              <span>সকল পঠিত শব্দ রিভিশন দিন ({allLearningItems.length})</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      
      {/* Top Header: Progress */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-xs text-xs font-mono">
        <span className="text-[#737885] dark:text-[#8d97ab] font-bengali">
          রিভিউ শব্দ: <strong>{currentIndex + 1}</strong> / {activeQueue.length}
        </span>
        <span className="text-[#c23b22] font-bold">
          L{currentItem.lesson} • {currentItem.categoryKey}
        </span>
      </div>

      {/* Main Review Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] text-center space-y-4 relative">
        
        {/* Star bookmark toggle */}
        <button
          onClick={() => onToggleFavorite(currentItem.id)}
          className="absolute top-4 right-4 p-2 text-amber-500 hover:scale-110 transition cursor-pointer"
        >
          <Star className={`w-5 h-5 ${favoriteIds.has(currentItem.id) ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Kanji & Furigana */}
        <div className="py-2">
          <h2 className="text-4xl sm:text-5xl font-extrabold font-japanese text-[#191c21] dark:text-[#f6f8fb] tracking-tight">
            {currentItem.kanji}
          </h2>
          <p className="text-lg font-japanese text-[#737885] dark:text-[#8d97ab] mt-1">
            {currentItem.furigana}
          </p>
          <p className="text-xs text-[#b8860b] dark:text-[#d4af37] font-mono mt-0.5">
            {currentItem.romaji}
          </p>
        </div>

        {/* Audio Button */}
        <div>
          <button
            onClick={() => speakJapanese(currentItem.furigana || currentItem.kanji)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121] text-xs font-semibold hover:bg-[#fae7e4] transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>উচ্চারণ শুনুন</span>
          </button>
        </div>

        {/* Answer Reveal Section */}
        {isAnswerShown ? (
          <div className="pt-4 border-t border-[#e8e3d8] dark:border-[#222735] space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <div className="font-bengali font-bold text-lg text-[#191c21] dark:text-[#f6f8fb]">
                {currentItem.meaningBn}
              </div>
              {currentItem.exampleJp && (
                <div className="mt-2 text-xs text-[#737885] dark:text-[#8d97ab] font-japanese">
                  {currentItem.exampleJp}
                  {currentItem.exampleBn && (
                    <div className="font-bengali text-[#737885] dark:text-[#8d97ab] mt-0.5">
                      {currentItem.exampleBn}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SRS Rating Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleRating('again')}
                className="py-2.5 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-xs font-bengali transition cursor-pointer"
              >
                আবার (1 দিন)
              </button>
              <button
                onClick={() => handleRating('hard')}
                className="py-2.5 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-bold text-xs font-bengali transition cursor-pointer"
              >
                কঠিন
              </button>
              <button
                onClick={() => handleRating('good')}
                className="py-2.5 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-bold text-xs font-bengali transition cursor-pointer"
              >
                ভালো
              </button>
              <button
                onClick={() => handleRating('easy')}
                className="py-2.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-bold text-xs font-bengali transition cursor-pointer"
              >
                সহজ
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <button
              onClick={() => setIsAnswerShown(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-sm font-bengali shadow-md shadow-[#c23b22]/20 transition cursor-pointer active:scale-98"
            >
              অর্থ ও উত্তর দেখুন
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
