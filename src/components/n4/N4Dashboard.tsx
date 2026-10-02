import React from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Layers, 
  BookMarked, 
  Award, 
  Flame, 
  Star, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Volume2,
  BookOpen
} from 'lucide-react';
import { N4ActiveTab, N4UserStats } from '../../data/n4/types';
import { N4_TOTAL_COUNT, N4_LESSONS_META } from '../../data/n4';

interface N4DashboardProps {
  stats: N4UserStats;
  statusCounts: {
    total: number;
    newWords: number;
    learning: number;
    mastered: number;
    reviewDue: number;
    learned: number;
    percentMastered: number;
    percentLearned: number;
  };
  favoriteCount: number;
  onNavigateTab: (tab: N4ActiveTab) => void;
  onSelectLesson: (lesson: number) => void;
}

export const N4Dashboard: React.FC<N4DashboardProps> = ({
  stats,
  statusCounts,
  favoriteCount,
  onNavigateTab,
  onSelectLesson,
}) => {
  const currentLessonMeta = N4_LESSONS_META.find(m => m.lesson === stats.currentLesson) || N4_LESSONS_META[0];
  const dailyPercent = Math.min(100, Math.round((stats.todayStudiedCount / (stats.dailyGoal || 1)) * 100));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* HERO SECTION: EXECUTIVE JAPANESE MINIMALIST SUITE */}
      <section className="relative overflow-hidden rounded-3xl bg-[#141720] text-white p-6 sm:p-10 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] border border-[#222735]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c23b22]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#b8860b]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Traditional Japanese Seal Stamp Accent */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 border border-[#c23b22]/40 rounded-xl px-2.5 py-1 text-center font-japanese text-[11px] text-[#c23b22] tracking-widest hidden sm:block bg-[#c23b22]/5">
          四級 • 中級
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#d4af37] text-xs font-semibold mb-4 border border-[#d4af37]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>মিন্না নো নিহোঙ্গো ২য় খণ্ড: লেসন ২৬ — ৫০</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-japanese leading-tight mb-3 text-[#f6f8fb]">
            JLPT N4 <span className="font-bengali text-[#c23b22] text-2xl sm:text-4xl font-extrabold">শব্দভাণ্ডার</span>
          </h1>

          <p className="text-sm sm:text-base text-[#b0b8c8] font-bengali leading-relaxed mb-6">
            জাপানি কাঞ্জি, হিরাগানা রিডিং, বিশুদ্ধ বাংলা অর্থ ও ব্যবহারিক উদাহরণসহ সম্পূর্ণ N4 শব্দভাণ্ডার আয়ত্ত করুন।
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('flashcards')}
              className="px-5 py-2.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-sm shadow-lg shadow-[#c23b22]/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2 cursor-pointer font-bengali"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>পড়াশোনা শুরু করুন</span>
            </button>

            <button
              onClick={() => {
                onSelectLesson(stats.currentLesson);
                onNavigateTab('flashcards');
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#1e2330] hover:bg-[#282f40] text-white font-bold text-sm border border-[#2e374a] transition flex items-center gap-2 cursor-pointer font-bengali"
            >
              <BookMarked className="w-4 h-4 text-[#d4af37]" />
              <span>লেসন {stats.currentLesson} চালিয়ে যান</span>
            </button>

            <button
              onClick={() => onNavigateTab('resources')}
              className="px-4 py-2.5 rounded-2xl bg-[#1e2330] hover:bg-[#282f40] text-white font-bold text-sm border border-[#2e374a] transition flex items-center gap-2 cursor-pointer font-bengali"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>রিসোর্স ও ব্যাকরণ</span>
            </button>

            {statusCounts.reviewDue > 0 && (
              <button
                onClick={() => onNavigateTab('review')}
                className="px-4 py-2.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer font-bengali shadow-md animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>কুইক রিভিউ ({statusCounts.reviewDue})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* STATS OVERVIEW CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Vocabulary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#c23b22]/40 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali">মোট শব্দ</span>
            <div className="p-2 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#191c21] dark:text-[#f6f8fb]">
              {statusCounts.total}
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              ২৫টি অধ্যায় জুড়ে
            </div>
          </div>
        </div>

        {/* Mastered Words */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#c23b22]/40 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali">সম্পূর্ণ আয়ত্ত</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {statusCounts.mastered}
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              {statusCounts.percentMastered}% আয়ত্ত করা হয়েছে
            </div>
          </div>
        </div>

        {/* Learning Queue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#c23b22]/40 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali">শিখছেন (Learning)</span>
            <div className="p-2 rounded-xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22]">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#c23b22]">
              {statusCounts.learning}
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              রিভিউ ও অনুশীলনে
            </div>
          </div>
        </div>

        {/* New / Unstudied */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#c23b22]/40 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali">নতুন শব্দ (New)</span>
            <div className="p-2 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#737885] dark:text-[#8d97ab]">
              {statusCounts.newWords}
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              অপেক্ষমান
            </div>
          </div>
        </div>

      </section>

      {/* DAILY GOAL PROGRESS TRACKER */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c23b22]" />
              <span>দৈনিক লক্ষ্যমাত্রা (Daily Goal)</span>
            </h3>
            <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">
              আজকের অর্জিত লক্ষ্য: <strong>{stats.todayStudiedCount}</strong> / {stats.dailyGoal}টি শব্দ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]">
              {dailyPercent}% সম্পন্ন
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#f5f2eb] dark:bg-[#1a1e2a] h-3 rounded-full overflow-hidden p-0.5 border border-[#e8e3d8] dark:border-[#222735]">
          <div 
            className="h-full bg-gradient-to-r from-[#c23b22] to-[#b8860b] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
      </section>

      {/* QUICK ACCESS MODES */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
            অধ্যয়ন ও অনুশীলন পদ্ধতি
          </h2>
          <button 
            onClick={() => onNavigateTab('quiz')}
            className="text-xs font-bold text-[#c23b22] hover:underline font-bengali flex items-center gap-1 cursor-pointer"
          >
            <span>সবগুলো মোড দেখুন</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigateTab('flashcards')}
            className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/50 shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] text-left transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] flex items-center justify-center mb-2.5 group-hover:bg-[#c23b22] group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
            <div className="font-bold text-[#191c21] dark:text-[#f6f8fb] text-sm font-bengali">
              ফ্ল্যাশকার্ড
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              3D ফ্লিপ ও উচ্চারণ
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('quiz')}
            className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/50 shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] text-left transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] flex items-center justify-center mb-2.5 group-hover:bg-[#c23b22] group-hover:text-white transition">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="font-bold text-[#191c21] dark:text-[#f6f8fb] text-sm font-bengali">
              কুইজ ও অনুশীলন
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              ইন্টারেক্টিভ মোড
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('review')}
            className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/50 shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] text-left transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] flex items-center justify-center mb-2.5 group-hover:bg-[#c23b22] group-hover:text-white transition">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="font-bold text-[#191c21] dark:text-[#f6f8fb] text-sm font-bengali flex items-center justify-between">
              <span>স্পেসড রিভিউ</span>
              {statusCounts.reviewDue > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#c23b22] text-white text-[9px] font-mono">
                  {statusCounts.reviewDue}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              SRS মেমরি রিভিশন
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('resources')}
            className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/50 shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] text-left transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] flex items-center justify-center mb-2.5 group-hover:bg-[#c23b22] group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="font-bold text-[#191c21] dark:text-[#f6f8fb] text-sm font-bengali">
              রিসোর্স ও ব্যাকরণ
            </div>
            <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              কণা, কাউন্টারস ও নিয়মাবলী
            </div>
          </button>

        </div>
      </section>

      {/* LESSONS QUICK LIST */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
              N4 লেসনসমূহ (Lesson 26–50)
            </h2>
            <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
              মিন্না নো নিহোঙ্গো ২য় খণ্ডের ২৫টি পাঠ
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('lessons')}
            className="px-3.5 py-1.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bold font-bengali flex items-center gap-1 transition cursor-pointer"
          >
            <span>সব অধ্যায় ব্রাউজ করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {N4_LESSONS_META.slice(0, 10).map((lesson) => (
            <div
              key={lesson.lesson}
              onClick={() => {
                onSelectLesson(lesson.lesson);
                onNavigateTab('flashcards');
              }}
              className="p-3 rounded-2xl bg-[#fbf9f5] dark:bg-[#171b26] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/50 hover:bg-[#f5f2eb] dark:hover:bg-[#1c2130] transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs text-[#191c21] dark:text-[#f6f8fb]">
                  L{lesson.lesson}
                </span>
                <span className="text-[10px] text-[#737885] dark:text-[#8d97ab] font-mono">
                  {lesson.count} শব্দ
                </span>
              </div>
              <div className="text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali truncate group-hover:text-[#c23b22] transition">
                {lesson.titleBn}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
