import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  BookOpen, 
  Volume2, 
  Turtle, 
  ArrowRight, 
  Search, 
  Sliders, 
  Sparkles,
  Layers,
  Award,
  Bell,
  Check,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { VocabItem, PracticeRecord } from '../types';
import { speakJapanese, speakBangla, playSuccessChime } from '../utils/sound';
import { EmptyState } from './EmptyState';

interface ReviewDashboardProps {
  allVocab: VocabItem[];
  practiceRecords: Record<number, PracticeRecord>;
  bookmarkedIds: Set<number>;
  masteredIds: Set<number>;
  onStartReview: () => void;
  onOpenCardInFlashcard?: (item: VocabItem) => void;
  onToggleMastered: (id: number) => void;
  onToggleBookmark: (id: number) => void;
  onOpenReminderSettings: () => void;
  onOpenVoiceSettings?: () => void;
}

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  allVocab,
  practiceRecords,
  bookmarkedIds,
  masteredIds,
  onStartReview,
  onOpenCardInFlashcard,
  onToggleMastered,
  onToggleBookmark,
  onOpenReminderSettings,
  onOpenVoiceSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'needs_practice' | 'recent' | 'graduated'>('needs_practice');

  // Map of all items for fast lookup
  const vocabMap = useMemo(() => {
    const map = new Map<number, VocabItem>();
    allVocab.forEach((item) => map.set(item.id, item));
    return map;
  }, [allVocab]);

  // Words that currently need practice (in practiceRecords and not yet mastered/graduated)
  const needsPracticeItems = useMemo(() => {
    const records = Object.values(practiceRecords) as PracticeRecord[];
    return records
      .filter((rec) => !masteredIds.has(rec.id) && !rec.graduatedAt)
      .sort((a, b) => {
        // Prioritize words with higher wrongCount and fewer consecutiveCorrect
        if (b.wrongCount !== a.wrongCount) {
          return b.wrongCount - a.wrongCount;
        }
        const timeB = new Date(b.lastReviewedAt || b.addedAt || 0).getTime();
        const timeA = new Date(a.lastReviewedAt || a.addedAt || 0).getTime();
        return timeB - timeA;
      })
      .map((rec) => ({
        vocab: vocabMap.get(rec.id)!,
        record: rec,
      }))
      .filter((item) => Boolean(item.vocab));
  }, [practiceRecords, masteredIds, vocabMap]);

  // Words recently reviewed (whether still practicing or graduated)
  const recentlyReviewedItems = useMemo(() => {
    const records = Object.values(practiceRecords) as PracticeRecord[];
    return records
      .filter((rec) => Boolean(rec.lastReviewedAt))
      .sort((a, b) => new Date(b.lastReviewedAt || 0).getTime() - new Date(a.lastReviewedAt || 0).getTime())
      .slice(0, 15)
      .map((rec) => ({
        vocab: vocabMap.get(rec.id)!,
        record: rec,
      }))
      .filter((item) => Boolean(item.vocab));
  }, [practiceRecords, vocabMap]);

  // Words that graduated from practice (eventually learned after needing practice)
  const graduatedItems = useMemo(() => {
    const records = Object.values(practiceRecords) as PracticeRecord[];
    return records
      .filter((rec) => masteredIds.has(rec.id) || Boolean(rec.graduatedAt))
      .sort((a, b) => new Date(b.graduatedAt || b.addedAt || 0).getTime() - new Date(a.graduatedAt || a.addedAt || 0).getTime())
      .map((rec) => ({
        vocab: vocabMap.get(rec.id)!,
        record: rec,
      }))
      .filter((item) => Boolean(item.vocab));
  }, [practiceRecords, masteredIds, vocabMap]);

  // Filtered by search query
  const filteredList = useMemo(() => {
    const list = 
      activeTab === 'needs_practice' 
        ? needsPracticeItems 
        : activeTab === 'recent' 
        ? recentlyReviewedItems 
        : graduatedItems;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(({ vocab }) => {
      return (
        vocab.kanji.toLowerCase().includes(q) ||
        vocab.hiragana.toLowerCase().includes(q) ||
        vocab.romaji.toLowerCase().includes(q) ||
        vocab.bn.toLowerCase().includes(q)
      );
    });
  }, [activeTab, needsPracticeItems, recentlyReviewedItems, graduatedItems, searchQuery]);

  const total = allVocab.length;
  const knownCount = masteredIds.size;
  const needsPracticeCount = needsPracticeItems.length;
  const unlearnedCount = Math.max(0, total - knownCount - needsPracticeCount);

  return (
    <div id="review-dashboard" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* 1. HERO PRACTICE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#191c21] via-[#1f242e] to-[#141720] text-white p-6 sm:p-8 shadow-xl border border-[#e8e3d8]/20 dark:border-[#222735]">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#c5a880]/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-56 h-56 rounded-full bg-[#c23b22]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#c5a880] text-xs font-bengali font-bold border border-white/10">
              <Flame className="w-3.5 h-3.5 fill-[#c23b22] text-[#c23b22] animate-pulse" />
              <span>স্মার্ট ভোকাবুলারি রিটেনশন ও রিভিউ সিস্টেম</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-bengali leading-snug">
              {needsPracticeCount > 0 ? (
                <span>
                  আপনার <span className="text-[#c5a880] font-mono underline decoration-[#c5a880]/40">{needsPracticeCount}টি শব্দ</span> অনুশীলনের অপেক্ষায়!
                </span>
              ) : (
                <span>অসাধারণ! বর্তমানে কোনো দুর্বল শব্দ বাকি নেই</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 font-bengali leading-relaxed">
              ফ্ল্যাশকার্ডে "জানিনা" দিলে সেই শব্দ স্বয়ংক্রিয়ভাবে এখানে জমা হয়। নিয়মিত মাত্র ৫ মিনিট দুর্বল শব্দগুলো চর্চা করলে তা দীর্ঘমেয়াদে স্মৃতিতে স্থায়ী হয়।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
            {needsPracticeCount > 0 ? (
              <button
                id="btn-start-review-hero"
                onClick={onStartReview}
                className="flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-2xl bg-[#c23b22] hover:bg-[#ab301a] text-white font-bold font-bengali text-sm shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>অনুশীলন শুরু করুন ({needsPracticeCount})</span>
              </button>
            ) : (
              <button
                id="btn-start-review-all"
                onClick={onStartReview}
                className="flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-2xl bg-white hover:bg-stone-100 text-[#191c21] font-bold font-bengali text-sm shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#c5a880]" />
                <span>সম্পূর্ণ রিভিশন দিন</span>
              </button>
            )}

            <button
              onClick={onOpenReminderSettings}
              className="flex items-center justify-center gap-2 min-h-[46px] px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bengali font-semibold transition cursor-pointer shadow-xs backdrop-blur-md"
              title="রিমাইন্ডার সময়সূচি পরিবর্তন করুন"
            >
              <Bell className="w-4 h-4 text-[#c5a880]" />
              <span>রিমাইন্ডার সেটিংস</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. LEARNING RETENTION METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Needs Practice */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#c23b22] dark:text-[#e0452d] font-bengali">অনুশীলন প্রয়োজন</span>
            <AlertCircle className="w-4 h-4 text-[#c23b22] dark:text-[#e0452d]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#c23b22] dark:text-[#e0452d] font-mono">
              {needsPracticeCount}
            </span>
            <span className="text-xs text-[#c23b22]/80 dark:text-[#e0452d]/80 font-bengali ml-1.5">টি শব্দ</span>
          </div>
        </div>

        {/* Mastered / Known */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-bengali">আয়ত্ত করা শব্দ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {knownCount}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-bengali ml-1.5">টি</span>
          </div>
        </div>

        {/* Graduated from Practice */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#474b54] dark:text-[#cbd3e1] font-bengali">প্র্যাকটিস থেকে শেখা</span>
            <TrendingUp className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#191c21] dark:text-[#f6f8fb] font-mono">
              {graduatedItems.length}
            </span>
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali ml-1.5">টি</span>
          </div>
        </div>

        {/* Bookmarked Words */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#474b54] dark:text-[#cbd3e1] font-bengali">বুকমার্ক করা</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#191c21] dark:text-[#f6f8fb] font-mono">
              {bookmarkedIds.size}
            </span>
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali ml-1.5">টি</span>
          </div>
        </div>

      </div>

      {/* 3. VOCABULARY TABS & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-[#141720] p-4 sm:p-5 rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Subtabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f5f2eb] dark:bg-[#1a1e2a] rounded-2xl font-bengali text-xs">
            <button
              onClick={() => setActiveTab('needs_practice')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'needs_practice'
                  ? 'bg-[#c23b22] dark:bg-[#e0452d] text-white shadow-xs'
                  : 'text-[#474b54] dark:text-[#cbd3e1] hover:text-[#191c21] dark:hover:text-white'
              }`}
            >
              অনুশীলন প্রয়োজন ({needsPracticeItems.length})
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'recent'
                  ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] shadow-xs'
                  : 'text-[#474b54] dark:text-[#cbd3e1] hover:text-[#191c21] dark:hover:text-white'
              }`}
            >
              সম্প্রতি চর্চা করা ({recentlyReviewedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('graduated')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'graduated'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[#474b54] dark:text-[#cbd3e1] hover:text-[#191c21] dark:hover:text-white'
              }`}
            >
              শেখা সম্পন্ন ({graduatedItems.length})
            </button>
          </div>

          {/* Search bar within review dashboard */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737885] dark:text-[#8d97ab]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="তালিকায় খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] rounded-xl text-xs text-[#191c21] dark:text-[#f6f8fb] placeholder-[#737885] dark:placeholder-[#8d97ab] focus:outline-hidden focus:border-[#c23b22] dark:focus:border-[#e0452d] font-bengali"
            />
          </div>

        </div>

        {/* 4. ACTIVE VOCABULARY LIST CARDS */}
        {filteredList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 font-bengali">
              {activeTab === 'needs_practice'
                ? 'অনুশীলন তালিকায় কোনো শব্দ নেই'
                : 'কোনো ফলাফল পাওয়া যায়নি'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mt-1 max-w-sm mx-auto">
              ফ্ল্যাশকার্ড পড়ার সময় কোনো শব্দ না পারলে "জানিনা" চাপুন, সেটি স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {filteredList.map(({ vocab, record }) => {
              const isBookmarked = bookmarkedIds.has(vocab.id);
              const isMastered = masteredIds.has(vocab.id);

              return (
                <div
                  key={vocab.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f5f2eb]/60 dark:hover:bg-[#1a1e2a]/40 px-2 rounded-2xl transition"
                >
                  {/* Left: Kanji & Meaning */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#9ea3b0] dark:text-[#5d677d] w-8">
                      #{vocab.id}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-bold font-japanese text-[#191c21] dark:text-[#f6f8fb]">
                          {vocab.kanji}
                        </span>
                        
                        {/* Audio Buttons */}
                        <button
                          onClick={() => speakJapanese(vocab.hiragana || vocab.kanji, { slow: false })}
                          className="p-1.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] text-[#c23b22] dark:text-[#e0452d] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
                          title="উচ্চারণ শুনুন"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => speakJapanese(vocab.hiragana || vocab.kanji, { slow: true })}
                          className="p-1.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
                          title="ধীর উচ্চারণ"
                        >
                          <Turtle className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-[#c23b22] dark:text-[#e0452d] font-japanese">
                        {vocab.hiragana}
                        <span className="text-[#737885] dark:text-[#8d97ab] font-mono ml-1.5 font-normal">
                          [{vocab.romaji}]
                        </span>
                      </div>
                    </div>

                    <div className="ml-2 pl-3 border-l border-[#e8e3d8] dark:border-[#222735]">
                      <p className="text-sm font-bold font-bengali text-[#191c21] dark:text-[#f6f8fb]">
                        {vocab.bn}
                      </p>
                      <span className="text-[10px] text-[#737885] dark:text-[#8d97ab] font-bengali">
                        {vocab.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Practice Stats & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5">
                    
                    {/* Practice Metric Pills */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#c23b22]/10 dark:bg-[#e0452d]/15 text-[#c23b22] dark:text-[#e0452d] border border-[#c23b22]/25" title="ভুল হয়েছে কতবার">
                        ভুল: {record.wrongCount}x
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735]" title="মোট রিভিশন হয়েছে">
                        রিভিউ: {record.reviewCount}x
                      </span>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => onToggleBookmark(vocab.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-white dark:bg-[#141720] text-[#9ea3b0] hover:text-amber-500 border-[#e8e3d8] dark:border-[#222735]'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Mark as Mastered / Graduated */}
                    <button
                      onClick={() => {
                        onToggleMastered(vocab.id);
                        playSuccessChime();
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bengali font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-[#141720] text-[#191c21] dark:text-[#f6f8fb] hover:text-emerald-600 border-[#e8e3d8] dark:border-[#222735]'
                      }`}
                      title={isMastered ? 'শেখা সম্পন্ন' : 'আয়ত্ত হয়েছে চিহ্নিত করুন'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isMastered ? 'শেখা শেষ' : 'আয়ত্ত হয়েছে'}</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
